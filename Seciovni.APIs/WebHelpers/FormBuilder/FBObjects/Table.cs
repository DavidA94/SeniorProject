using Seciovni.APIs.WebHelpers.FormBuilder.FBObjects.Bases;
using System.Collections.Generic;

namespace Seciovni.APIs.WebHelpers.FormBuilder.FBObjects
{
    public class Table : FBObject
    {
        public List<Dictionary<string, Cell>> Cells { get; set; }
        public List<double> ColumnWidths { get; set; }
        public double ContentHeight { get; set; }
        public double HeaderHeight { get; set; }
    }
}
