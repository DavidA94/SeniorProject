namespace Shared.ApiResponses
{
    public class BindingOptionData
    {
        public BindingOptionData(string category, string display, string value, BindingType type)
        {
            Category = category;
            Display = display;
            Value = value;
            Type = type;
        }

        public string Category { get; set; }
        public string Display { get; set; }
        public string Value { get; set; }
        public BindingType Type { get; set; }
    }
}
