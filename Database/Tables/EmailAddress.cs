using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    public class EmailAddress
    {
        [EmailAddress]
        [Key]
        public string Email { get; set; }

        public static implicit operator string(EmailAddress e) => e.Email;
        public static implicit operator EmailAddress(string e) => new EmailAddress { Email = e };
    }
}
