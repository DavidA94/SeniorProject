using Database.Tables;
using Newtonsoft.Json;
using Shared;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Seciovni.APIs.Contracts
{
    public class EmployeeData
    {
        [StringLength(30)]
        [Required]
        public string FirstName { get; set; }

        [StringLength(30)]
        [Required]
        public string LastName { get; set; }

        // TODO: [Index(IsUnique = true)]
        [StringLength(50)]
        [EmailAddress]
        [Required]
        public string Email { get; set; }

        public string OriginalEmail { get; set; }

        public JobType Job { get; set; }
        public IEnumerable<string> Permissions { get; set; }

        public Employee ToEmployee(IEnumerable<Permission> permissions)
        {
            return new Employee()
            {
                Job = Job,
                User = User.MakeNewUser(FirstName, LastName, Email, permissions.Where(p => Permissions.Contains(p.PermissionType)))
            };
        }

        public static EmployeeData FromEmployee(Employee e)
        {
            return new EmployeeData
            {
                Email = e.User.Email,
                FirstName = e.User.FirstName,
                Job = e.Job,
                LastName = e.User.LastName,
                Permissions = e.User.UserPermisions.Select(p => p.PermissionType).ToList()
            };
        }

        /// <summary>
        /// We want to deserialize <see cref="OriginalEmail"/> , but not serialize it
        /// </summary>
        /// <returns></returns>
        public bool ShouldSerializeOriginalEmail() => false;
    }
}
