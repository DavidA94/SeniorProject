using Database.Tables;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.AddressTypes
{
    public class Address
    {
        [Key]
        public int AddressID { get; set; }

        [ForeignKey(nameof(Customer))]
        public int CustomerID { get; set; }
    }
}
