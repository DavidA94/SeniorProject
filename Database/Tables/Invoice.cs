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

        public DateTime InvoiceDate { get; set; }

        public Customer Buyer { get; set; }

        public IList<VehicleInfo> Vehicles { get; set; }

        public InvoiceState State { get; set; }

        public IList<MiscellaneousFee> Fees { get; set; }
        
        public User SalesPerson { get; set; }

        [Required]
        public decimal DocFee { get; set; }

        [Required]
        public decimal Downpayment { get; set; }

        [Required]
        public decimal TaxAmount { get; set; }

        public LienHolder LienHolder { get; set; }

        public IList<Payment> Payments { get; set; }

        // NOTE: Prompt user if this will change -- Use latest version if not on this list
        public IList<InvoicePageTemplate> PagesUsed { get; set; } = null;

        public IList<InvoiceInvoicePageTemplate> IIPT { get; set; }

    }
}
