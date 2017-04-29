using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Database.Tables.ManyManyTables
{
    public class InvoiceInvoicePageTemplate
    {
        public int InvoiceIdentity { get; set; }
        public Invoice Invoice { get; set; }

        public int TemplateID { get; set; }
        public InvoicePageTemplate InvoicePageTempate { get; set; }
    }
}
