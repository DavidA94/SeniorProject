using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    public class Permission
    {
        [Key]
        // TODO: [Index(IsUnique = true)]
        public string PermissionType { get; set; }

        [Required]
        public string Description { get; set; }
    }
}
