using Database.Tables;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Linq;
using Shared;

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

        [Phone]
        public string PrimaryPhone { get; set; }

        [Phone]
        public string HomePhone { get; set; }

        [Phone]
        public string CellPhone { get; set; }

        [Phone]
        public string WorkPhone { get; set; } 
        
        public List<EmailAddress> Emails { get; set; }

        /// <summary>
        /// Foreign key to be able to access who owns a customer
        /// </summary>
        public int EmployeeID { get; set; }

        /// <summary>
        /// Checks if the current customer matches the given rhs only by the things
        /// that are given when the customer is typed in manually in an invoice.
        /// </summary>
        /// <param name="rhs">The customer that was given from the invoice page</param>
        /// <returns></returns>
        public bool SoftEquals(Customer rhs)
        {
            return rhs.Address.StreetAddress == Address.StreetAddress &&
                   rhs.Address.City == Address.City &&
                   rhs.Address.State == Address.State &&
                   rhs.Address.ZipCode == Address.ZipCode &&
                   rhs.User.FirstName == User.FirstName &&
                   rhs.User.LastName == User.LastName &&
                   rhs.User.Email.ToLower() == User.Email.ToLower() &&
                   PrimaryPhone == rhs.PrimaryPhone &&
                   Comparison.AreEqual(rhs.CompanyName, CompanyName) &&
                   Comparison.AreEqual(rhs.DealerLicenseNumber, DealerLicenseNumber) &&
                   Comparison.AreEqual(rhs.MCNumber, MCNumber) &&
                   Comparison.AreEqual(rhs.ResaleNumber, ResaleNumber);
        }
    }
}
