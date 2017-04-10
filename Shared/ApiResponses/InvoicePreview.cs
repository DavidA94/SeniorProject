using System;

namespace Shared.ApiResponses
{
    public class InvoicePreview
    {
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int InvoiceNumber { get; set; }
        public string BuyerName { get; set; }
        public decimal InvoiceTotal { get; set; }
        public decimal TotalDue { get; set; }
        public string SalesPerson { get; set; }
    }
}
