using Database.Tables.ManyManyTables;
using Newtonsoft.Json;
using Shared;
using Shared.CustomFormatters;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class Invoice
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        [JsonIgnore]
        public int InvoiceIdentity { get; set; }

        [PrintFormat("D4")]
        public int InvoiceID { get; set; }

        [Required]
        [PrintFormat(typeof(DateTime))]
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
        [PrintFormat(FixedPlaces = 2, Prefix = "$ ")]
        public decimal DocFee { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        [PrintFormat(FixedPlaces = 2, Prefix = "$ ")]
        public decimal DownPayment { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        [PrintFormat(FixedPlaces = 2, Prefix = "$ ")]
        public decimal TaxAmount { get; set; }

        public LienHolder LienHolder { get; set; }

        public IList<Payment> Payments { get; set; }

        [JsonIgnore]
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
