using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Seciovni.APIs.WebHelpers.FormBuilder
{
    public enum Orientation { LANDSCAPE, PORTRAIT };

    public enum Location
    {
        Top = 1,
        Right = 4,
        Bottom = 2,
        Left = 8,
        Center = 16,
        None = 0
    };

    public enum BindingContext
    {
        BOTH = 0,
        REPEATING = 1,
        SINGLE = 2
    };
}
