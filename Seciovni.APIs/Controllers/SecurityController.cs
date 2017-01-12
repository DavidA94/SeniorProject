using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.WebHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.EntityFrameworkCore;

namespace Seciovni.APIs.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class SecurityController : ApiController
    {
        private SeciovniContext db;

        public SecurityController(SeciovniContext context)
        {
            db = context;
        }

        [Authorize]
        [HttpPost("Login")]
        public IEnumerable<string> Login([FromBody]string email)
        {
            //string userObjectID = (Context.User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier"))?.Value;
            //var realemail = getAuthorizedUserEmail(userObjectID).Result;

            if (email == null) return null;

            var user = db.Users.Include(c => c.UserPermisions).FirstOrDefault(u => u.Email.ToLower() == email.ToLower());

            if (user == null) return null;

            // Otherwise, get the user's allowed types from the database
            var allowed = new List<string>();
            allowed.AddRange(user.UserPermisions.Select(up => up.PermissionType));

            // Check if they've already logged in
            var loginToken = Request.Headers.Authorization.Parameter;

            // If they haven't already been logged in
            if (db.Logins.FirstOrDefault(l => l.LoginToken == loginToken) != null)
            {
                // Log them in
                db.Logins.Add(new UserLogin()
                {
                    InitialLoginTime = DateTime.Now,
                    LastPingTime = DateTime.Now,
                    LoginToken = loginToken,
                    User = user
                });

                if (db.SaveChanges() == 0)
                {
                    return null;
                }
            }

            return allowed;
        }

        [AllowAnonymous]
        [HttpGet("test")]
        public string Test()
        {
            return "ABC";
        }

        [Authorize]
        private async Task<string> getAuthorizedUserEmail(string userId)
        {
            const string GRPAH_USER_URL = "https://graph.windows.net/{0}/users/{1}?api-version=1.6";

            try
            {
                string tenantId = "84fa7f0f-39b8-4d35-894a-b2b8cc5741a9";

                var authContext = new AuthenticationContext($"https://login.microsoftonline.com/{tenantId}", new NativeSessionCache(userId));
                // APISecret
                ClientCredential credential = new ClientCredential("c171df2c-edf2-47c3-9c4e-2f1572ea6dda", "Hg60P4810Y0KM+PfFrW6fG94XArGFvJ+7vuA0bxB3y0=");
                var result = await authContext.AcquireTokenAsync("https://graph.windows.net", credential);

                // Call the graph API and get the user's profile
                using (var client = new HttpClient())
                {
                    //var address = string.Format(GRPAH_USER_URL, WebUtility.UrlEncode("dra151994hotmail.onmicrosoft.com"), userId);
                    var address = "https://graph.windows.net/me?api-version=1.6";

                    using (var request = new HttpRequestMessage(HttpMethod.Get, address))
                    {
                        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", result.AccessToken);

                        var response = await client.SendAsync(request);

                        // Invalid permissions?
                        if (response.IsSuccessStatusCode)
                        {
                            string responseStr = await response.Content.ReadAsStringAsync();

                            return responseStr;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }

            return null;
        }
    }
}
