namespace Shared.FormBuilderObjects.Properties
{
    public class TRBL
    {
        private double m_top;
        private double m_right;
        private double m_bottom;
        private double m_left;

        public double Top
        {
            get { return m_top; }
            set { m_top = FormBuilder.PxToPt(value); }
        }
        public double Right
        {
            get { return m_right; }
            set { m_right = FormBuilder.PxToPt(value); }
        }
        public double Bottom
        {
            get { return m_bottom; }
            set { m_bottom = FormBuilder.PxToPt(value); }
        }
        public double Left
        {
            get { return m_left; }
            set { m_left = FormBuilder.PxToPt(value); }
        }
    }
}
