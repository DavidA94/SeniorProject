using Shared;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class PhoneNumber
    {
        [Key]
        [Phone]
        // [Index(IsUnique = true)]
        [Display(Name = "Phone Number")]
        public string Number { get; set; }

        [Display(Name = "Phone Type")]
        public PhoneType Type { get; set; }
    }
}
