using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class PhoneNumber
    {
        [Phone]
        [Index(IsUnique = true)]
        public string Number { get; set; }
    }
}
