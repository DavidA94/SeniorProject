using Database.AddressTypes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class Customer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomerID { get; set; }

        public User User { get; set; }
        public Address Address { get; set; }

        public string CompanyName { get; set; }
        public string DealerLicenseNumber { get; set; }
        public string MCNumber { get; set; }
        public string ResaleNumber { get; set; }
        public string Group { get; set; }

        public List<PhoneNumber> PhoneNumbers { get; set; }

        public List<EmailAddress> Emails { get; set; }
    }
}
