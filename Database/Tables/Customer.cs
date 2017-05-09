using Shared;
using Shared.Extensions;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace Database.Tables
{
    public class Customer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomerID { get; set; }

        public int PreviousCustomerID { get; set; }

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
        [Display(Name = "Primary Phone")]
        public string PrimaryPhone { get; set; }

        [Phone]
        [Display(Name = "Home Phone")]
        public string HomePhone { get; set; }

        [Phone]
        [Display(Name = "Cell Phone")]
        public string CellPhone { get; set; }

        [Phone]
        [Display(Name = "Work Phone")]
        public string WorkPhone { get; set; }

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

        public void CleanUp()
        {
            User.FirstName = User.FirstName?.Trim();
            User.LastName = User.LastName?.Trim();
            User.Email = User.Email?.Trim();

            Address.StreetAddress = Address?.StreetAddress?.Trim();
            Address.City = Address?.City?.Trim();
            Address.State = Address?.State?.Trim();
            Address.ZipCode = Address?.ZipCode?.Trim();

            PrimaryPhone = makePrettyNumber(PrimaryPhone?.TrimOrNull());
            CellPhone = makePrettyNumber(CellPhone?.TrimOrNull());
            HomePhone = makePrettyNumber(HomePhone?.TrimOrNull());
            WorkPhone = makePrettyNumber(WorkPhone?.TrimOrNull());

            CompanyName = CompanyName?.TrimOrNull();
            DealerLicenseNumber = DealerLicenseNumber?.TrimOrNull();
            MCNumber = MCNumber?.TrimOrNull();
            ResaleNumber = ResaleNumber?.TrimOrNull();
        }

        private string makePrettyNumber(string phoneNumber)
        {
            if (phoneNumber == null) return null;

            phoneNumber = phoneNumber.Trim();
            string pattern = @"^(?:1[.\-]?)?([0-9]{3})[.\-]?([0-9]{3})[.\-]?([0-9]{4})$";

            var match = Regex.Match(phoneNumber, pattern);
            if (match.Success)
            {
                return $"1-{match.Groups[1].Value}-{match.Groups[2].Value}-{match.Groups[3].Value}";
            }

            return phoneNumber;
        }
    }
}
