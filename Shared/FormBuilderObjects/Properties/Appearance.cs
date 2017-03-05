namespace Shared.FormBuilderObjects.Properties
{
    public class Appearance
    {
        private double m_strokeThickness;

        public string Background { get; set; }
        public string Foreground { get; set; }
        public string StrokeColor { get; set; }
        public double StrokeThickness
        {
            get { return m_strokeThickness; }
            set { m_strokeThickness = FormBuilder.PxToPt(value); }
        }
    }
}
