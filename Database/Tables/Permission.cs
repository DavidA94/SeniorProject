using Shared;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class Permission
    {
        [Key]
        [Index(IsUnique = true)]
        public PermissionType PermissionType { get; set; }

        [Required]
        public string Description { get; set; }
    }
}
