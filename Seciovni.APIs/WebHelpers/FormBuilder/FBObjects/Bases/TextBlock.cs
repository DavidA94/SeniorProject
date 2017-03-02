using Newtonsoft.Json;
using Seciovni.APIs.WebHelpers.FormBuilder.Properties;
using System.Collections.Generic;
using System.Linq;

namespace Seciovni.APIs.WebHelpers.FormBuilder.FBObjects.Bases
{
    public class TextBlock
    {
        public Dictionary<string, Binding> Bindings { get; set; }
        public Font Font { get; set; }
        public Layout Layout { get; set; }
        public double? MaxHeight { get; set; }
        public double? MaxWidth { get; set; }
        public string Text { get; set; }
        public bool VerticallyCenter { get; set; }
        
        [JsonIgnore]
        public bool HasBindingError
        {
            get
            {
                return Bindings.Any(kv => string.IsNullOrEmpty(kv.Value?.Value));
            }
        }
    }
}
