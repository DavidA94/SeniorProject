using Database.Tables.ManyManyTables;
using Shared;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class Invoice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InvoiceID { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public DateTime ModifiedDate { get; set; }

        [Required]
        public Customer Buyer { get; set; }

        public IList<VehicleInfo> Vehicles { get; set; }

        public InvoiceState State { get; set; }

        public IList<MiscellaneousFee> Fees { get; set; }
        
        public Employee SalesPerson { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public decimal DocFee { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public decimal DownPayment { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public decimal TaxAmount { get; set; }

        public LienHolder LienHolder { get; set; }

        public IList<Payment> Payments { get; set; }

        // NOTE: Prompt user if this will change -- Use latest version if not on this list
        public IList<InvoicePageTemplate> PagesUsed { get; set; } = null;

        public IList<InvoiceInvoicePageTemplate> IIPT { get; set; }

        public decimal GetTotal()
        {
            decimal total = TaxAmount + DocFee - DownPayment;

            foreach (var vehicle in Vehicles) total += vehicle.Price;
            foreach (var fee in Fees) total += fee.Price;

            return total;
        }

        public decimal GetDue()
        {
            decimal due = GetTotal();

            foreach (var payment in Payments) due -= payment.Amount;

            return due;
        }
    }
}
