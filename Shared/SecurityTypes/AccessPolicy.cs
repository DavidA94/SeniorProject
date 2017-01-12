﻿using System.Collections.Generic;

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

        public static IEnumerable<string> GetAllPolicies()
        {
            return new List<string> { AdminPrivilege, EditInvoicePrivilege, FormEditorPrivilege, ViewInvoicePrivilege };
        }
    }
}
