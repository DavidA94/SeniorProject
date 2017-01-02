using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserID { get; set; }

        [StringLength(30)]
        [Required]
        public string FirstName { get; set; }

        [StringLength(30)]
        [Required]
        public string LastName { get; set; }

        [Index(IsUnique = true)]
        [StringLength(50)]
        [EmailAddress]
        [Required]
        public string Email { get; set; }

        [Required]
        public byte[] Password { get; set; }

        public byte[] Salt { get; set; } 

        public bool MustResetPassword { get; set; } = false;

        [StringLength(64)]
        public string ResetToken { get; set; } = null;

        public DateTime ResetTimeout { get; set; }

        public List<Permission> Permisions { get; set; } = new List<Permission>();

        public List<Customer> Contacts { get; set; } = new List<Customer>();
    }
}
