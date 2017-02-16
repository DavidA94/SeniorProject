using Database.CustomValidators;
using System.ComponentModel.DataAnnotations;

namespace Database.Tables
{
    public class VehicleInfo
    {
        private string m_vin;

        // TODO: [Index(IsUnique = true)]
        [Key]
        [Required]
        public string StockNum { get; set; }

        [VIN]
        // TODO: [Index(IsUnique = true)]
        public string VIN {
            get { return m_vin; }
            set { m_vin = value?.ToUpper(); }
        }

        [Required]
        public int Year
        {
            get { return getYearFromVIN(); }
            set { }
        }

        [Required]
        public string Make
        {
            get { return getMakeFromVIN(); }
            set { }
        }

        [Required]
        public string Model { get; set; }

        [Required]
        public int Miles { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public decimal Price { get; set; }

        public override bool Equals(object obj)
        {
            if(obj != null && obj is VehicleInfo)
            {
                var rhs = obj as VehicleInfo;

                return rhs.Location == Location &&
                       rhs.Miles == Miles &&
                       rhs.Model == Model &&
                       rhs.Price == Price &&
                       rhs.StockNum == StockNum &&
                       rhs.VIN == VIN;
            }

            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            return (new { Location, Miles, Model, Price, StockNum, VIN }).GetHashCode();
        }

        private int getYearFromVIN()
        {
            var year = char.ToUpper(VIN[9]);
            int parsedYear = -1;


            if (!int.TryParse(year.ToString(), out parsedYear))
            {
                if (year == 84)
                {
                    parsedYear = 1996; //If T then 1996
                }
                else if (year >= 86 && year < 90)
                {
                    parsedYear = year - 86 + 1997; //If V (86) then subtract that and add 1997 (Value of V) for proper year
                }
                else if (year >= 65 && year < 73)
                {
                    parsedYear = year - 65 + 2010; // If A (65) then subtract that and add 2010 (Value of A) for proper year
                }
                else if (year >= 74 && year < 79)
                {
                    parsedYear = year - 74 + 2018; // If J (74) then subtract that and add 2018 (Value of J) for proper year
                }
                else if (year == 80)
                {
                    parsedYear = 2023; // If P (80) then 2023
                }
                else if (year >= 82 && year < 84)
                {
                    parsedYear = year - 82 + 2024; // If R (82) then subtract that and add 2023 (Value of R) for proper year
                }
            }
            // Must be a number, since the above passed
            else
            {
                parsedYear += 2000;
            }

            return parsedYear;
        }

        private string getMakeFromVIN()
        {
            var make = VIN.Substring(1, 2).ToUpper();

            switch (make)
            {
                case "AK":
                case "FU": // Freightliner
                    return "Freightliner";
                case "HS": // International
                    return "International";
                case "XK":
                case "WK": // Kenworth
                    return "Kenworth";
                case "XP": // Peterbilt
                    return "Peterbilt";
                case "V1":
                case "V2":
                case "V3":
                case "V4":
                case "VJ":
                case "VK": // Volvo
                    return "Volvo";
                case "GR": // Great Dane
                    return "Great Dane";
                case "L0": // Lufkin
                    return "Lufkin";
                case "UY":
                    return "Utility";
                case "JJ": // Wabash
                    return "Wabash";
                case "1V": // Ottawa
                    return "Ottawa";
                case "LM": // Capacity
                    return "Capacity";
                case "P9":
                    return "Pratt";
                default:
                    return null;
            }
        }
    }
}
