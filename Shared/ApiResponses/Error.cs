namespace Shared.ApiResponses
{
    public class Error
    {
        public Error(string element, string[] subFields, string errorMsg)
        {
            Element = element;
            SubFields = subFields;
            ErrorMsg = errorMsg;
        }

        public string Element { get; set; }
        public string[] SubFields { get; set; }
        public string ErrorMsg { get; set; }
    }
}
