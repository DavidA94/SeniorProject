using Shared.CustomFormatters;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class MiscellaneousFee
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FeeID { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [PrintFormat(FixedPlaces = 2, Prefix = "$ ")]
        public decimal Price { get; set; }

        public override bool Equals(object obj)
        {
            if (obj != null && obj is MiscellaneousFee)
            {
                var rhs = obj as MiscellaneousFee;

                return rhs.Description == Description &&
                       rhs.Price == Price;
            }

            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return (new { Description, Price }).GetHashCode();
        }
    }
}
