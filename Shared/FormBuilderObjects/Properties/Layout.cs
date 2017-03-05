namespace Shared.FormBuilderObjects.Properties
{
    public class Layout
    {
        private double m_x;
        private double m_y;
        private double m_width;
        private double m_height;

        public double X
        {
            get { return m_x; }
            set { m_x = FormBuilder.PxToPt(value); }
        }
        public double Y
        {
            get { return m_y; }
            set { m_y = FormBuilder.PxToPt(value); }
        }
        public double Height
        {
            get { return m_height; }
            set { m_height = FormBuilder.PxToPt(value); }
        }
        public double Width
        {
            get { return m_width; }
            set { m_width = FormBuilder.PxToPt(value); }
        }
        public TRBL Margin { get; set; }
        public TRBL Padding { get; set; }
    }
}
