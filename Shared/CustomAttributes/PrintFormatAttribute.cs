using System;

namespace Shared.CustomFormatters
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class PrintFormatAttribute : Attribute
    {
        public PrintFormatAttribute(){}
        public PrintFormatAttribute(Type t){
            Type = t;
        }
        public PrintFormatAttribute(string f)
        {
            Format = f;
        }

        public virtual string Format { get; set; } = null;
        public virtual Type Type { get; set; }
        public virtual string Prefix { get; set; } = "";
        public virtual int FixedPlaces { get; set; } = 0;
    }
}
