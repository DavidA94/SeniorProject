using Database.Tables;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using Shared.SecurityTypes;
using System.Linq;
using System.Net.Http;

namespace Seciovni.APIs.WebHelpers
{
    public static class ValidateRequest
    {
        public static bool HasValidLogin(this HttpRequestMessage request, SeciovniContext db)
        {
            // Valid user will not be null
            return request.GetUser(db) != null;
        }

        public static bool HasValidLogin(this HttpRequestMessage request, SeciovniContext db, out User user)
        {
            // Valid user will not be null
            var u = request.GetUser(db);
            user = u;            
            return u != null;
        }

        public static bool CanAccess(this HttpRequestMessage request, SeciovniContext db, string neededPermission)
        {
            // EF 7 is weird, in that it doesn't do lazy loading, so we have to do this is an odd way
            
            // Get the user
            var user = request.GetUser(db);

            // If the user has been disabled, then no-go
            if (user.Disabled) return false;
            
            // Check if the permission has the user
            var permission = db.Permissions.Include(p => p.UserPermissions)
                                .FirstOrDefault(p => p.PermissionType == neededPermission || 
                                                p.PermissionType == AccessPolicy.AdminPrivilege)
                                .UserPermissions.FirstOrDefault(up => up.UserID == user?.UserID);

            return permission != null;
        }

        public static User GetUser(this HttpRequestMessage request, SeciovniContext db)
        {
            var token = request.Headers.Authorization.Parameter.Replace("Bearer ", "");

            var login = db.Logins.Include(l => l.User).FirstOrDefault(l => l.LoginToken == token);

            return login?.User;
        }
    }
}
