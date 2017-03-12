namespace Shared.FormBuilderObjects
{
    public class FormBuilder
    {
        public string Title { get; set; }
        public Canvas Canvas { get; set; }
        public InvoiceState States { get; set; }

        public static double PxToPt(double value)
        {
            return value;
        }
    }
}
