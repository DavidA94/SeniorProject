using Database.Tables;
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

        [Display(Name = "Company Name")]
        public string CompanyName { get; set; }

        [Display(Name = "Dealer License Number")]
        public string DealerLicenseNumber { get; set; }

        [Display(Name = "MC Number")]
        public string MCNumber { get; set; }

        [Display(Name = "Resale Number")]
        public string ResaleNumber { get; set; }

        public string Group { get; set; }

        public List<PhoneNumber> PhoneNumbers { get; set; }

        public List<EmailAddress> Emails { get; set; }
    }
}
