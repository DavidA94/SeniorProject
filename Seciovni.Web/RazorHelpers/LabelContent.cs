using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Seciovni.Web.RazorHelpers
{
    // You may need to install the Microsoft.AspNetCore.Razor.Runtime package into your project
    [HtmlTargetElement("label", Attributes = LabelContentAttributeName)]
    public class LabelContent : TagHelper
    {
        public const string LabelContentAttributeName = "label-content";

        [HtmlAttributeName(LabelContentAttributeName)]
        public ModelExpression For { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var content = For.Metadata.DisplayName ?? For.Metadata.PropertyName;
            output.Content.SetContent(content);
        }
    }
}
