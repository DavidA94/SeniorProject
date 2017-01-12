using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    public class EmailAddress
    {
        [EmailAddress]
        [Key]
        public string Email { get; set; }
    }
}
