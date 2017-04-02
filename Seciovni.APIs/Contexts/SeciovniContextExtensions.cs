using Database.Tables;
using Shared;
using Shared.SecurityTypes;
using System.Collections.Generic;
using System.Linq;

namespace Seciovni.APIs.Contexts
{
    public static class SeciovniContextExtensions
    {
        public static void EnsureSeedData(this SeciovniContext context)
        {
            if (!context.Permissions.Any() || !context.Users.Any())
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
                context.SaveChanges();

                var devnull = new Employee
                {
                    User = User.MakeNewUser("Dev", "Null", "devnull@localhost", new List<Permission> { }),
                    Job = JobType.Admin
                };


                var defaultUser = new Employee
                {
                    User = User.MakeNewUser("David", "Antonucci", "dra151994@hotmail.com", permissions),
                    Job = JobType.Assistant
                };



                var otherUser = new Employee
                {
                    User = User.MakeNewUser("John", "Doe", "JohnDoe@dra151994hotmail.onmicrosoft.com", 
                        new List<Permission> { permissions[1], permissions[3] }),
                    Job = JobType.Sales
                };

                context.Employees.Add(devnull);
                context.Employees.Add(defaultUser);
                context.Employees.Add(otherUser);
                context.SaveChanges();

                var lance = new Customer()
                {
                    Address = new Address()
                    {
                        City = "Murfreesboro",
                        Country = Country.USA,
                        State = "TN",
                        StreetAddress = "2049 Buffalo Creek Rd.",
                        ZipCode = "37130"
                    },
                    CompanyName = "Get My Furniture",
                    DealerLicenseNumber = "AZ 33280",
                    PrimaryPhone = "615-895-7269",
                    User = new User()
                    {
                        FirstName = "Lance",
                        LastName = "Glover",
                        Email = "LanceMGillespie@jourrapide.com"
                    }
                };

                var melinda = new Customer()
                {
                    Address = new Address()
                    {
                        City = "Cherokee",
                        Country = Country.USA,
                        State = "OK",
                        StreetAddress = "66 Simpson Square",
                        ZipCode = "73728"
                    },
                    CompanyName = "Army Spy",
                    DealerLicenseNumber = "OK 88280",
                    PrimaryPhone = "580-596-1036",
                    User = new User()
                    {
                        FirstName = "Melinda",
                        LastName = "Young",
                        Email = "MelindaPYoung@armyspy.com"
                    }
                };

                defaultUser.Contacts = new List<Customer> { lance, melinda };
                context.SaveChanges();
            }
        }
    }
}
