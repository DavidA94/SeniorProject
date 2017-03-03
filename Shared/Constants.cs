namespace Shared
{
    public class Constants
    {
        public const int AUTO_NUM_PAGES = -1;

        public const string API_BASE_ADDR = "https://localhost:44357";

        public const string AUTH_TOKEN = "AuthorizationToken";
        public const string AUTH_TOKEN_TIME = "AuthorizationTokenTime";

        /// <summary>
        /// The ID of the employee that owns all customers that are added on the fly in invoices.
        /// He also takes over deprecated customers when they're updated with new information to
        /// ensure data-consistency
        /// </summary>
        public const int DEVNULL_EMPLOYEE_ID = 1;

        public const string OVERWRITE_HEADER = "Overwrite";
    }
}
