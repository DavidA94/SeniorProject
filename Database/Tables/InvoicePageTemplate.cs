using Database.Tables.ManyManyTables;
using Newtonsoft.Json;
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
        [JsonIgnore]
        public int TemplateID { get; set; }

        public string TemplateTitle { get; set; }

        public InvoiceState States { get; set; }

        public string TemplateJSON { get; set; }

        [JsonIgnore]
        public List<InvoiceInvoicePageTemplate> IIPT { get; set; }
    }
}
