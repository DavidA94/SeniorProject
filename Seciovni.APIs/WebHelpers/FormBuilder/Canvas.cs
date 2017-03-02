using Seciovni.APIs.WebHelpers.FormBuilder.FBObjects.Bases;
using System.Collections.Generic;

namespace Seciovni.APIs.WebHelpers.FormBuilder
{
    public class Canvas
    {
        public double GridSize { get; set; }
        public int NumPages { get; set; }
        public Orientation Orientation { get; set; }
        public List<FBObject> Shapes { get; set; }
    }
}
