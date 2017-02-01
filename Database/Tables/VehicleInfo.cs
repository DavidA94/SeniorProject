using Database.CustomValidators;
using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    public class VehicleInfo
    {
        private string m_vin;

        // TODO: [Index(IsUnique = true)]
        [Key]
        public string StockNum { get; set; }

        [VIN]
        // TODO: [Index(IsUnique = true)]
        public string VIN {
            get { return m_vin; }
            set { m_vin = value?.ToUpper(); }
        }

        public int Year { get; set; }

        public string Make { get; set; }

        public string Model { get; set; }

        public int Miles { get; set; }

        public string Location { get; set; }

        public decimal Price { get; set; }
    }
}
