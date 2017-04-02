namespace Shared.Extensions
{
    public static class StringExtensions
    {
        public static string TrimOrNull(this string s)
        {
            s = s?.Trim();
            if (string.IsNullOrWhiteSpace(s)) s = null;

            return s;
        }
    }
}
