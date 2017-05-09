using Database.Tables;
using System;
using System.Collections.Generic;

namespace Seciovni.APIs.Contracts
{
    public class SearchResult
    {
        public DateTime CreatedDate { get; set; }
        public int InvoiceNumber { get; set; }
        public string BuyerName { get; set; }
        public string SalesPerson { get; set; }

        public IEnumerable<MiscellaneousFee> Fees { get; set; }
        public IEnumerable<Payment> Payments { get; set; }
        public IEnumerable<VehicleInfo> Vehicles { get; set; }
        public Dictionary<string, string> OtherFields { get; set; }
    }
}
