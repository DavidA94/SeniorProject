using Seciovni.APIs.WebHelpers.FormBuilder.FBObjects.Bases;

namespace Seciovni.APIs.WebHelpers.FormBuilder.FBObjects
{
    public class FBImage : FBObject
    {
        public string ImgSrc { get; set; }
        public bool PreserveRatio { get; set; }
    }
}
