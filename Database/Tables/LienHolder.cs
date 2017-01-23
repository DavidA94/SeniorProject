using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class LienHolder
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LienID { get; set; }

        [Display(Name = "Lien Holder Name")]
        public string Name { get; set; }
        public Address Address { get; set; }
        public string EIN { get; set; }
    }
}
