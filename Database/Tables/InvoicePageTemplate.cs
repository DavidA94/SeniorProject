using Database.Tables.ManyManyTables;
using Shared;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class InvoicePageTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TemplateID { get; set; }

        public string TemplateTitle { get; set; }

        public string TemplateJSON { get; set; }

        public List<InvoiceInvoicePageTemplate> IIPT { get; set; }
    }
}
