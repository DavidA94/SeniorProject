using Database.Tables;
using Database.Tables.ManyManyTables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.Contracts;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.SecurityTypes;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;

namespace Seciovni.APIs.Controllers
{
    [Route("api/[controller]")]
    public class SettingsController : ApiController
    {
        private SeciovniContext db;

        public SettingsController(SeciovniContext context)
        {
            db = context;
        }

        [HttpGet(nameof(Users))]
        public IEnumerable<EmployeeData> Users()
        {
            var currentEmployee = validateUser(Request);
            if (currentEmployee == null) yield break;

            var dbEmployees = db.Employees.Include(e => e.User).ThenInclude(u => u.UserPermisions)
            /**/                          .Where(e => !e.User.Disabled &&
            /**/                                       e.User.Email != currentEmployee.User.Email &&
            /**/                                       e.EmployeeID != Constants.DEVNULL_EMPLOYEE_ID)
            /**/                          .OrderBy(e => e.User.FirstName);

            yield return EmployeeData.FromEmployee(currentEmployee);

            foreach (var employee in dbEmployees)
            {
                yield return EmployeeData.FromEmployee(employee);
            }
        }

        [HttpGet(nameof(Privileges))]
        public IEnumerable<string[]> Privileges()
        {
            if (validateUser(Request) != null)
            {
                var allPolicies = AccessPolicy.GetAllPoliciesFriendly();
                return db.Permissions.Select(p => new string[] { p.PermissionType, allPolicies[p.PermissionType], p.Description }).OrderBy(e => e[1]);
            }

            return null;
        }

        [HttpPost(nameof(Save))]
        public ApiResponse Save([FromBody]EmployeeData data)
        {
            var currentEmployee = validateUser(Request);
            if (currentEmployee == null) return new ApiResponse(false, "Access Denied");

            ModelState.Clear();
            Validate(data);

            if (!ModelState.IsValid)
            {
                var response = new ApiResponse(false, "Errors were found in the submission");

                foreach (var key in ModelState.Keys)
                {
                    var error = ModelState[key].Errors.FirstOrDefault();
                    if (error == null) continue;

                    var keyParts = key.Split('.');
                    response.Errors.Add(new Error(keyParts[0], keyParts.Skip(1).ToArray(), error.ErrorMessage));
                }

                response.Errors = response.Errors.OrderBy(e => e.ErrorMsg).ToList();
                return response;
            }

            // User cannot change their own data
            if (data.Email.ToLower() == currentEmployee.User.Email.ToLower())
            {
                return new ApiResponse(false, "You cannot change your own data");
            }

            // Get what we need from the database
            var dbPermissions = db.Permissions;
            var dbEmployees = db.Employees.Include(e => e.User).ThenInclude(u => u.UserPermisions);
            var employeeToEdit = dbEmployees.FirstOrDefault(e => e.User.Email.ToLower() == data.Email.ToLower());

            if (!string.IsNullOrWhiteSpace(data.OriginalEmail) && data.OriginalEmail.ToLower() != data.Email.ToLower())
            {
                // If we found an employee to edit, this isn't a valid operation
                if (employeeToEdit != null)
                {
                    return new ApiResponse(false, "The given email address is already in use");
                }

                employeeToEdit = dbEmployees.FirstOrDefault(e => e.User.Email.ToLower() == data.OriginalEmail.ToLower());
            }

            // Clean up the permissions they were given
            if (data.Job == JobType.Admin || data.Permissions.Contains(AccessPolicy.AdminPrivilege))
            {
                // Admins only need the one permission
                data.Permissions = new string[] { AccessPolicy.AdminPrivilege };
            }
            else if (data.Job == JobType.Manager || data.Job == JobType.Sales)
            {
                // Managers and sales people always can view and edit invoices
                data.Permissions = data.Permissions.Union(new string[] { AccessPolicy.EditInvoicePrivilege, AccessPolicy.ViewInvoicePrivilege });
            }

            // Ensure the user won't have no permissions
            if (data.Permissions.Count() == 0)
            {
                return new ApiResponse(false, "User must be granted at least one permission");
            }

            // If we have a new user
            if (employeeToEdit == null)
            {
                db.Employees.Add(data.ToEmployee(dbPermissions));

                if (db.SaveChanges() == 0)
                {
                    return new ApiResponse(false, $"An unknown error occurred while adding {data.FirstName} {data.LastName}");
                }

                return new ApiResponse(true, $"Successfully added {data.FirstName} {data.LastName}");
            }

            employeeToEdit.Job = data.Job;
            employeeToEdit.User.FirstName = data.FirstName;
            employeeToEdit.User.LastName = data.LastName;
            employeeToEdit.User.Email = data.Email;
            employeeToEdit.User.Disabled = false; // In case they're adding back in an existing user

            // Just clear and re-add the permissions
            db.Set<UserPermission>().RemoveRange(employeeToEdit.User.UserPermisions);
            db.SaveChanges();
            employeeToEdit.User.UserPermisions = Database.Tables.User.MakeNewUser("", "", "", dbPermissions.Where(p => data.Permissions.Contains(p.PermissionType))).UserPermisions;

            db.SaveChanges();
            return new ApiResponse(true, $"Successfully saved data for {data.FirstName} {data.LastName}");
        }

        [HttpDelete(nameof(Delete) + "/{email}")]
        public ApiResponse Delete(string email)
        {
            var currentUser = validateUser(Request);
            if (currentUser == null) return new ApiResponse(false, "Permission Denied");

            // Don't let them disable themselves
            if (currentUser.User.Email.ToLower() == email.ToLower())
            {
                return new ApiResponse(false, "You cannot delete yourself");
            }

            // Figure out who they want to disable
            var employeeToDisable = db.Employees.Include(e => e.User).FirstOrDefault(e => e.User.Email.ToLower() == email.ToLower());
            if (employeeToDisable == null || employeeToDisable.User.Disabled)
            {
                return new ApiResponse(false, "Unable to delete the selected user");
            }

            // Check if the user has permission to disable this user
            if (currentUser.Job != JobType.Admin && employeeToDisable.Job == JobType.Admin)
            {
                return new ApiResponse(false, "You must be an admin to delete an admin");
            }

            // Otherwise, we should be good to diable the user
            employeeToDisable.User.Disabled = true;
            db.SaveChanges();

            return new ApiResponse(true, $"{employeeToDisable.User.FirstName} was successfully deleted");
        }

        /// <summary>
        /// Checks if the current user has permission to access this section
        /// </summary>
        /// <param name="request">The request gotten from the user</param>
        /// <returns>The employee, or null if the user is not validated</returns>
        private Employee validateUser(HttpRequestMessage request)
        {
            User validatedUser;

            // Ensure the request is valid
            if (!request.HasValidLogin(db, out validatedUser) || !request.CanAccess(db, AccessPolicy.AdminPrivilege))
            {
                return null;
            }

            // Ensure the current employee is valid
            var employee = db.Employees.Include(e => e.User).FirstOrDefault(e => e.UserID == validatedUser.UserID);

            return employee;
        }
    }
}
