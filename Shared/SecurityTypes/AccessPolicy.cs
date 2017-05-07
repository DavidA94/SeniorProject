using System.Collections.Generic;

namespace Shared.SecurityTypes
{
    /// <summary>
    /// The available privledges
    /// </summary>
    public sealed class AccessPolicy
    {
        public const string AdminPrivilege = "Admin";
        public const string EditInvoicePrivilege = "Edit";
        public const string FormEditorPrivilege = "Form";
        public const string ViewInvoicePrivilege = "View";

        /// <summary>
        /// Gets the list of all available privileges 
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<string> GetAllPolicies()
        {
            return new List<string> { AdminPrivilege, FormEditorPrivilege, EditInvoicePrivilege, ViewInvoicePrivilege };
        }

        /// <summary>
        /// Maps the available privileges to user friendly strings
        /// </summary>
        /// <returns></returns>
        public static Dictionary<string, string> GetAllPoliciesFriendly()
        {
            return new Dictionary<string, string>
            {
                { AdminPrivilege, "Admin" },
                { FormEditorPrivilege, "Edit Form" },
                { EditInvoicePrivilege, "Edit Invoices" },
                { ViewInvoicePrivilege, "View Invoices" }
            };
        }
    }
}
