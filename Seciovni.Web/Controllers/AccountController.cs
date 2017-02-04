using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Seciovni.Web.WebHelpers;
using Shared;
using Shared.SecurityTypes;
using System;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace Seciovni.Web.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult SignIn()
        {
            return Challenge(
                new AuthenticationProperties { RedirectUri = "/" }, OpenIdConnectDefaults.AuthenticationScheme);
        }

        public IActionResult SignOut()
        {
            var callbackUrl = Url.Action("SignedOut", "Account", values: null, protocol: Request.Scheme);
            return SignOut(new AuthenticationProperties { RedirectUri = callbackUrl },
                CookieAuthenticationDefaults.AuthenticationScheme, OpenIdConnectDefaults.AuthenticationScheme);
        }

        public IActionResult SignedOut()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                // Redirect to home page if the user is authenticated.
                return RedirectToAction(nameof(HomeController.Dashboard), nameof(HomeController).Replace("Controller", ""));
            }

            return View();
        }

        [Authorize(Policy = AccessPolicy.AdminPrivilege)]
        [Authorize(Policy = AccessPolicy.EditInvoicePrivilege)]
        [Authorize(Policy = AccessPolicy.FormEditorPrivilege)]
        [Authorize(Policy = AccessPolicy.ViewInvoicePrivilege)]
        [HttpGet]
        public IActionResult GetAuthToken()
        {
            if (HttpContext.Session.Keys.Contains(Constants.AUTH_TOKEN) && 
                HttpContext.Session.Keys.Contains(Constants.AUTH_TOKEN_TIME))
            {
                byte[] ticks;
                
                HttpContext.Session.TryGetValue(Constants.AUTH_TOKEN_TIME, out ticks);

                DateTime expires = DateTime.FromBinary(BitConverter.ToInt64(ticks, 0));

                // If we've expired
                if(DateTime.Now - expires < TimeSpan.Zero)
                {
                    string token = ApiLogin.GetToken(User);

                    if (string.IsNullOrWhiteSpace(token)) return null;

                    // Need to login the user when a new token is generated
                    var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.Identity.Name;
                    ApiLogin.LoginUser(token, email);

                    HttpContext.Session.Set(Constants.AUTH_TOKEN, Encoding.ASCII.GetBytes(token));
                    HttpContext.Session.Set(Constants.AUTH_TOKEN_TIME, BitConverter.GetBytes(DateTime.UtcNow.AddMinutes(58).Ticks));

                    return Json(new { token = token, expires = $"{DateTime.UtcNow.AddMinutes(58)}+0" });
                }
                else
                {
                    byte[] tokenBytes;
                    string token;

                    if(HttpContext.Session.TryGetValue(Constants.AUTH_TOKEN, out tokenBytes))
                    {
                        token = Encoding.ASCII.GetString(tokenBytes);

                        return Json(new { token = token, expires = $"{expires}+0" });
                    }

                }
            }

            return null;
        }
    }
}
