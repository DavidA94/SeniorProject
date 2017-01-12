using Database.Tables;
using Shared;
using Shared.SecurityTypes;
using System.Collections.Generic;
using System.Linq;

namespace Database
{
    public static class SeciovniContextExtensions
    {
        public static void EnsureSeedData(this SeciovniContext context)
        {
            if (!context.Permissions.Any())
            {
                var permissions = new List<Permission> {
                    new Permission()
                    {
                        PermissionType = AccessPolicy.AdminPrivilege,
                        Description = "Allows the user access to every privledge"
                    },
                    new Permission()
                    {
                        PermissionType = AccessPolicy.EditInvoicePrivilege,
                        Description = "Allows the user to edit the invoices"
                    },
                    new Permission()
                    {
                        PermissionType = AccessPolicy.FormEditorPrivilege,
                        Description = "Allows the user to edit the forms"
                    },
                    new Permission()
                    {
                        PermissionType = AccessPolicy.ViewInvoicePrivilege,
                        Description = "Allows the user to view the invoices"
                    }
                };

                context.Permissions.AddRange(permissions);


                var defaultUser = new User()
                {
                    Email = "dra151994@hotmail.com",
                    FirstName = "David",
                    LastName = "Antonucci",
                    Permisions = permissions.Where(p => p.PermissionType == AccessPolicy.AdminPrivilege),
                };

                context.Users.Add(defaultUser);
            }
        }
    }
}
