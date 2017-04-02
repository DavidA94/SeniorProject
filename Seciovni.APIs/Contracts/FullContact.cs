using Database.Tables;
using Shared.ApiResponses;
using System.Collections.Generic;

namespace Seciovni.APIs.Contracts
{
    public class FullContact
    {
        public Customer Contact { get; set; }
        public IEnumerable<InvoicePreview> Invoices { get; set; }
    }
}
