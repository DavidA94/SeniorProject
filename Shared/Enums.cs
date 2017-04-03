using System;

namespace Shared
{
    [Flags]
    public enum InvoiceState {
        Arizona = 1,
        California = 2,
        Georgia = 4,
        Illinois = 8
    }

    public enum Country { Canada, Mexico, USA }

    public enum PageOrientation { LANDSCAPE, PORTRAIT };

    public enum PermissionType { Admin, Sales }

    public enum PhoneType { Cell, Home, Work }

    public enum JobType { Admin, Assistant, Manager, Sales }

    public enum BindingOption { BOTH, REPEATING, SINGLE }

    public enum BindingType { IGNORE, Date, InvoiceState, Range, State, Text }
}
