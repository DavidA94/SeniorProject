namespace Shared.FormBuilderObjects
{
    public enum Orientation { LANDSCAPE, PORTRAIT };
    public enum DocumentType
    {
        ONE_PER_INV = 0,
        ONE_PER_VEH = 1
    }

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
