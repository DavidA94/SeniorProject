using Shared.FormBuilderObjects.FBObjects.Bases;
using System.Collections.Generic;

namespace Shared.FormBuilderObjects.FBObjects
{
    public class Table : FBObject
    {
        private double m_contentHeight;
        private double m_headerHeight;

        public List<Dictionary<string, Cell>> Cells { get; set; }
        public List<double> ColumnWidths { get; set; }
        public double ContentHeight
        {
            get { return m_contentHeight; }
            set { m_contentHeight = FormBuilder.PxToPt(value); }
        }
        public double HeaderHeight
        {
            get { return m_headerHeight; }
            set { m_headerHeight = FormBuilder.PxToPt(value); }
        }
    }
}
