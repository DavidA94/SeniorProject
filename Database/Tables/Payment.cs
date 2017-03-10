using Shared.CustomFormatters;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PaymentID { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [PrintFormat(FixedPlaces = 2, Prefix = "$ ")]
        public decimal Amount { get; set; }

        public override bool Equals(object obj)
        {
            if(obj != null && obj is Payment)
            {
                var rhs = obj as Payment;

                return rhs.Amount == Amount &&
                       rhs.Date.Date.Equals(Date.Date) &&
                       rhs.Description == Description;
            }

            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return (new { Amount, Date.Date, Description }).GetHashCode();
        }
    }
}
