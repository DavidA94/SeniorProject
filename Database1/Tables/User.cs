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

        // TODO: [Index(IsUnique = true)]
        [StringLength(50)]
        [EmailAddress]
        [Required]
        public string Email { get; set; }

        public IEnumerable<Permission> Permisions { get; set; } = new List<Permission>();

        public IEnumerable<Customer> Contacts { get; set; } = new List<Customer>();
    }
}
