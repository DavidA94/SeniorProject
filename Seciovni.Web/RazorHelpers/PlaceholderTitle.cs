﻿using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Seciovni.Web.RazorHelpers
{
    // You may need to install the Microsoft.AspNetCore.Razor.Runtime package into your project
    [HtmlTargetElement("input", Attributes = PlaceholderTitleAttributeName)]
    public class PlaceholderTitle : TagHelper
    {
        public const string PlaceholderTitleAttributeName = "placeholder-title";

        [HtmlAttributeName(PlaceholderTitleAttributeName)]
        public ModelExpression For { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var propDisplay = For.Metadata.DisplayName ?? For.Metadata.PropertyName;
            //if (string.IsNullOrWhiteSpace(propDisplay)) propDisplay = For.Metadata.PropertyName;

            output.Attributes.SetAttribute("placeholder", propDisplay);
            output.Attributes.SetAttribute("title", propDisplay);
        }
    }
}
