using Database.Tables.ManyManyTables;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace Database.Tables
{
    public class User
    {
        [Key]
        [JsonIgnore]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserID { get; set; }

        [Display(Name = "First Name")]
        [StringLength(30)]
        [Required]
        public string FirstName { get; set; }

        [Display(Name = "Last Name")]
        [StringLength(30)]
        [Required]
        public string LastName { get; set; }
        
        // TODO: [Index(IsUnique = true)]
        [Display(Name = "Email")]
        [StringLength(50)]
        [EmailAddress]
        [Required]
        public string Email { get; set; }

        [JsonIgnore]
        public ICollection<UserPermission> UserPermisions { get; set; }

        public static User MakeNewUser(string first, string last, string email, IEnumerable<Permission> permissions)
        {
            var user = new User()
            {
                FirstName = first,
                LastName = last,
                Email = email,
            };

            var userPermissions = new List<UserPermission>();

            foreach (var permission in permissions)
            {
                userPermissions.Add(new UserPermission()
                {
                    User = user,
                    Permision = permission,
                    PermissionType = permission.PermissionType
                });
            }

            user.UserPermisions = userPermissions;

            return user;
        }

        public string FullName()
        {
            return $"{FirstName} {LastName}";
        }
    }
}
