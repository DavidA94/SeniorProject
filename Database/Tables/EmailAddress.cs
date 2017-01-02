using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    public class EmailAddress
    {
        [EmailAddress]
        public string Email { get; set; }
    }
}
