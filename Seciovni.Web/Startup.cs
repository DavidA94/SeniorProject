using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Newtonsoft.Json;
using Seciovni.Web.WebHelpers;
using Shared;
using Shared.Authorization;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Seciovni.Web
{
    public class Startup
    {
        public static string ClientId;
        public static string ClientSecret;
        public static string ClientResourceId;
        public static string Authority;
        public static string GraphResourceId;
        public static string ApiResourceId;

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsDevelopment())
            {
                // For more details on using the user secret store see http://go.microsoft.com/fwlink/?LinkID=532709
                builder.AddUserSecrets();
            }
            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            CanAccessRequirement.AddPolicies(services);

            // Add framework services.
            services.AddMvc();
            services.AddSession();

            services.AddAuthentication(SharedOptions => SharedOptions.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseSession();

            app.UseCookieAuthentication(new CookieAuthenticationOptions()
            {
                Events = new CookieAuthenticationEvents()
                {
                    OnValidatePrincipal = OnValidatePrincipal
                }
            });

            Authority = Configuration["Authentication:AzureAd:AADInstance"] + Configuration["Authentication:AzureAd:TenantId"];
            ClientId = Configuration["Authentication:AzureAd:ClientId"];
            ClientSecret = Configuration["Authentication:AzureAd:ClientSecret"];
            ClientResourceId = Configuration["Authentication:AzureAd:ClientResourceId"];
            GraphResourceId = Configuration["Authentication:AzureAd:GraphResourceId"];
            ApiResourceId = Configuration["Authentication:AzureAd:ApiResourceId"];

            app.UseOpenIdConnectAuthentication(new OpenIdConnectOptions
            {
                ClientId = ClientId,
                ClientSecret = ClientSecret,
                Authority = Authority,
                PostLogoutRedirectUri = Configuration["AzureAd:PostLogoutRedirectUri"],
                ResponseType = OpenIdConnectResponseType.CodeIdToken,
                CallbackPath = Configuration["Authentication:AzureAd:CallbackPath"],
                GetClaimsFromUserInfoEndpoint = false,

                Events = new OpenIdConnectEvents()
                {
                    OnRemoteFailure = OnAuthenticationFailed,
                    OnAuthorizationCodeReceived = OnAuthorizationCodeReceived
                }
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Dashboard}/{id?}");
            });
        }

        private Task OnAuthorizationCodeReceived(AuthorizationCodeReceivedContext context)
        {
            initAuthCode(context.Ticket.Principal, context.HttpContext.Session);
            //context.HandleCodeRedemption();

            return Task.FromResult(0);
        }

        // Handle sign-in errors differently than generic errors.
        private Task OnAuthenticationFailed(FailureContext context)
        {
            context.HandleResponse();
            context.Response.Redirect("/Home/Error?message=" + context.Failure.Message);
            return Task.FromResult(0);
        }

        private Task OnValidatePrincipal(CookieValidatePrincipalContext context)
        {
            initAuthCode(context.Principal, context.HttpContext.Session);
            return Task.FromResult(0);
        }

        private void initAuthCode(ClaimsPrincipal user, ISession session)
        {
            if (!session.Keys.Contains(Constants.AUTH_TOKEN))
            {
                // Get the email or stop
                var email = user.FindFirst(ClaimTypes.Email)?.Value ?? user.Identity.Name;
                if (email == null || !email.Contains('@')) return;

                // Get the authorization data so we can call to the API
                string userObjectID = (user.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier"))?.Value;
                AuthenticationContext authContext = new AuthenticationContext(Authority, new NativeSessionCache(userObjectID));
                ClientCredential credential = new ClientCredential(ClientId, ClientSecret);
                AuthenticationResult result = authContext.AcquireTokenAsync(ApiResourceId, credential).Result;

                session.Set(Constants.AUTH_TOKEN, Encoding.ASCII.GetBytes(result.AccessToken));

                // Get all the user's permissions
                using (var client = new HttpClient())
                {
                    var address = $"{Constants.API_BASE_ADDR}/api/security/Login";

                    using (var request = new HttpRequestMessage(HttpMethod.Post, address))
                    {
                        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", result.AccessToken);
                        request.Content = new StringContent($@"""{email}""", Encoding.UTF8, "application/json");

                        var response = client.SendAsync(request).Result;

                        if (response.IsSuccessStatusCode)
                        {
                            var permissions = JsonConvert.DeserializeObject<List<string>>(response.Content.ReadAsStringAsync().Result);

                            // Add the claims
                            (user.Identity as ClaimsIdentity).AddClaims(permissions.Select(p => new Claim(p.ToString(), "True")));
                        }
                    }
                }
            }
        }
    }
}
