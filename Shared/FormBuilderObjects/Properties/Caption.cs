using Shared.FormBuilderObjects.FBObjects.Bases;

namespace Shared.FormBuilderObjects.Properties
{
    public class Caption
    {
        private double m_reserve;

        public Location Location { get; set; }
        public double Reserve
        {
            get { return m_reserve; }
            set { m_reserve = FormBuilder.PxToPt(value); }
        }
        public TextBlock TextBlock { get; set; }
    }
}
