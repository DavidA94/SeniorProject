using Newtonsoft.Json;
using Shared.FormBuilderObjects.Properties;
using System.Collections.Generic;
using System.Linq;

namespace Shared.FormBuilderObjects.FBObjects.Bases
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

        public bool AutoHeight { get; set; }
        public bool AutoWidth { get; set; }

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
