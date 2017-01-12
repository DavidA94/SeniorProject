using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Shared.SecurityTypes;

namespace Shared.Authorization
{
    public class CanAccessRequirement : IAuthorizationRequirement
    {
        public CanAccessRequirement(string policy)
        {
            Policy = policy;
        }

        public string Policy { get; private set; }

        public static void AddPolicies(IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                foreach(var accessPolicy in AccessPolicy.GetAllPolicies())
                {
                    options.AddPolicy(accessPolicy, policy => policy.Requirements.Add(new CanAccessRequirement(accessPolicy)));
                }
            });
            services.AddSingleton<IAuthorizationHandler, CanAccessHandler>();
        }
    }
}
