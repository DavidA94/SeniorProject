using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shared.ApiResponses
{
    public class BindingOptionData
    {
        public BindingOptionData(string category, string display, string value)
        {
            Category = category;
            Display = display;
            Value = value;
        }

        public string Category { get; set; }
        public string Display { get; set; }
        public string Value { get; set; }
    }
}
