using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
