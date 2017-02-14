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
using Newtonsoft.Json.Serialization;
using Seciovni.Web.WebHelpers;
using Shared;
using Shared.Authorization;
using System;
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
            services.AddMvc()
                    .AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());
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

            ApiLogin.Authority = Configuration["Authentication:AzureAd:AADInstance"] + Configuration["Authentication:AzureAd:TenantId"];
            ApiLogin.ClientId = Configuration["Authentication:AzureAd:ClientId"];
            ApiLogin.ClientSecret = Configuration["Authentication:AzureAd:ClientSecret"];
            ApiLogin.ClientResourceId = Configuration["Authentication:AzureAd:ClientResourceId"];
            ApiLogin.GraphResourceId = Configuration["Authentication:AzureAd:GraphResourceId"];
            ApiLogin.ApiResourceId = Configuration["Authentication:AzureAd:ApiResourceId"];

            app.UseOpenIdConnectAuthentication(new OpenIdConnectOptions
            {
                ClientId = ApiLogin.ClientId,
                ClientSecret = ApiLogin.ClientSecret,
                Authority = ApiLogin.Authority,
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
            initAuthCode(context.Ticket.Principal, context.HttpContext.Session, context.HttpContext);
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
            initAuthCode(context.Principal, context.HttpContext.Session, context.HttpContext);
            return Task.FromResult(0);
        }
        
        private void initAuthCode(ClaimsPrincipal user, ISession session, HttpContext context)
        {
            if (!session.Keys.Contains(Constants.AUTH_TOKEN))
            {
                var email = user.FindFirst(ClaimTypes.Email)?.Value ?? user.Identity.Name;
                if (email == null || !email.Contains('@')) return;

                string token = ApiLogin.GetToken(user);

                if (string.IsNullOrWhiteSpace(token)) return;

                session.Set(Constants.AUTH_TOKEN, Encoding.ASCII.GetBytes(token));
                session.Set(Constants.AUTH_TOKEN_TIME, BitConverter.GetBytes(DateTime.UtcNow.AddMinutes(58).Ticks));

                // Add the claims
                var claims = ApiLogin.LoginUser(token, email) ?? new List<string> { };
                (user.Identity as ClaimsIdentity).AddClaims(claims.Select(p => new Claim(p.ToString(), "True")));
            }
        }
    }
}
