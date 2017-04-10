using System;

namespace Shared.Extensions
{
    public static class NumberExtensions
    {
        public static double Clip(this double number, double min, double max)
        {
            return Math.Max(min, Math.Min(number, max));
        }
    }
}
