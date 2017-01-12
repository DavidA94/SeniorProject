using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;
using System.Diagnostics;

namespace Shared.Authorization
{
    public class CanAccessHandler : AuthorizationHandler<CanAccessRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, CanAccessRequirement requirement)
        {
            // If we don't have the claim, then it's not valid
            Debug.WriteLine(context.User.Claims.Select(c => c.Type));
            if (!context.User.HasClaim(c => c.Type == requirement.Policy)) return Task.FromResult(0);

            // Otherwise, set it as sucessful.
            context.Succeed(requirement);

            return Task.FromResult(0);
        }
    }
}
