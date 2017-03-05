using Shared.FormBuilderObjects.FBObjects.Bases;
using System.Collections.Generic;

namespace Shared.FormBuilderObjects
{
    public class Canvas
    {
        public double GridSize { get; set; }
        public int NumPages { get; set; }
        public Orientation Orientation { get; set; }
        public List<FBObject> Shapes { get; set; }
    }
}
