﻿namespace Shared
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

        public const int WYSIWYG_PPI = 70;
        public const float WYSIWYG_PAGE_HEIGHT = 11.0f * WYSIWYG_PPI;
        public const float WYSIWYG_PAGE_WIDTH = 8.5f * WYSIWYG_PPI;
        public const double WYSIWYG_FLH_RATIO = 1.4;
        public const float WYSIWYG_TABLE_BORDER_SIZE = 1;

        public const string API_ROOT_IMG_FOLDER = "wwwroot\\FormBuilder\\Images";
    }
}
