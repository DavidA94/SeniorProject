namespace Shared.FormBuilderObjects.Properties
{
    public class Font
    {
        private double m_size;

        public string Alignment { get; set; }
        public bool Bold { get; set; }
        public string Color { get; set; }
        public string Family { get; set; }
        public bool Italic { get; set; }
        public double Size
        {
            get { return m_size; }
            set { m_size = FormBuilder.PxToPt(value); }
        }
    }
}
