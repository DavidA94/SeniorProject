using System;

namespace Shared.CustomFormatters
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class PrintFormatAttribute : Attribute
    {
        public PrintFormatAttribute(){}

        public virtual string Prefix { get; set; } = "";
        public virtual int FixedPlaces { get; set; } = 0;
    }
}
