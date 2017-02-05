using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Newtonsoft.Json;
using Shared;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

namespace Seciovni.Web.WebHelpers
{
    public class ApiLogin
    {
        // It will timeout from MS at 60 minutes or maybe 30?
        public static TimeSpan Timeout = TimeSpan.FromMinutes(28);

        public static string ClientId;
        public static string ClientSecret;
        public static string ClientResourceId;
        public static string Authority;
        public static string GraphResourceId;
        public static string ApiResourceId;

        public static string GetToken(ClaimsPrincipal user)
        {
            // Get the authorization data so we can call to the API
            string userObjectID = (user.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier"))?.Value;
            AuthenticationContext authContext = new AuthenticationContext(Authority, new NativeSessionCache(userObjectID));
            ClientCredential credential = new ClientCredential(ClientId, ClientSecret);
            AuthenticationResult result = authContext.AcquireTokenAsync(ApiResourceId, credential).Result;

            return result.AccessToken;
        }

        /// <summary>
        /// Logs the user in with the current token
        /// </summary>
        /// <param name="token">The token gotten from <see cref="GetToken(ClaimsPrincipal, ISession)"/> </param>
        /// <param name="userEmail">The user's email</param>
        /// <returns>A list of the users permissions</returns>
        public static List<string> LoginUser(string token, string userEmail)
        {
            // Get all the user's permissions
            using (var client = new HttpClient())
            {
                var address = $"{Constants.API_BASE_ADDR}/api/security/Login";

                using (var request = new HttpRequestMessage(HttpMethod.Post, address))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    request.Content = new StringContent($@"""{userEmail}""", Encoding.UTF8, "application/json");

                    var response = client.SendAsync(request).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        return JsonConvert.DeserializeObject<List<string>>(response.Content.ReadAsStringAsync().Result);
                    }

                    return null;
                }
            }
        }

    }
}
