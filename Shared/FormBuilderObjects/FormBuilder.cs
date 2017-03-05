namespace Shared.FormBuilderObjects
{
    public class FormBuilder
    {
        public string Title { get; set; }
        public Canvas Canvas { get; set; }

        public static double PxToPt(double value)
        {
            return value * 0.75;
        }
    }
}
