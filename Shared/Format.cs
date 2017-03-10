using Shared.CustomFormatters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shared
{
    public static class Format
    {
        public static string ForPrint(PrintFormatAttribute format, object value)
        {
            if(format == null || !(value is double || value is decimal || value is int))
            {
                return value?.ToString();
            }

            // Zero with no prefix = "-"
            if(value.ToString() == "0" && format.Prefix == null)
            {
                return "-";
            }
            
            return format.Prefix + Convert.ToDouble(value).ToString($"N{format.FixedPlaces}");
        }
    }
}
