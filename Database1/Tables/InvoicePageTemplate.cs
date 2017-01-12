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

        public HashSet<InvoiceTemplateBinding> Bindings { get; set; }

        public int NumPages { get; set; }

        public PageOrientation Orientation { get; set; }
    }
}
