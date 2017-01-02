using Database.CustomValidators;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables
{
    public class VehicleInfo
    {
        private string m_vin;

        [Index(IsUnique = true)]
        public string StockNum { get; set; }

        [VIN]
        [Index(IsUnique = true)]
        public string VIN {
            get { return m_vin; }
            set { m_vin = value?.ToUpper(); }
        }

        public int Year { get; set; }

        public string Location { get; set; }

        public decimal Price { get; set; }
    }
}
