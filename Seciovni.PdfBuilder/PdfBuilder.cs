using Database.Tables;
using Shared;
using Shared.FormBuilderObjects;
using Shared.FormBuilderObjects.FBObjects;
using Shared.FormBuilderObjects.FBObjects.Bases;
using Syncfusion.Drawing;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Reflection;
using Syncfusion.Pdf.Grid;

namespace Seciovni.PdfBuilder
{
    public static class PdfBuilder
    {
        private static PdfDocument m_doc = null;
        private static Invoice m_invoice = null;

        public static void Generate(FormBuilder fb, Invoice invoice)
        {
            m_invoice = invoice;

            m_doc = new PdfDocument();
            m_doc.DocumentInformation.Title = invoice.InvoiceDate.ToString("YYYY-mm-dd") + " " + invoice.Buyer.User.FullName() + " Invoice";
            
            PdfPage page = m_doc.Pages.Add();

            foreach(dynamic shape in fb.Canvas.Shapes)
            {
                Draw(page.Graphics, shape);
                DrawMain(page.Graphics, shape);
            }
            
            using (MemoryStream stream = new MemoryStream())
            {
                m_doc.Save(stream);

                File.WriteAllBytes("Test.pdf", stream.ToArray());
            }
            
            m_doc = null;
            m_invoice = null;
        }

        private static void Draw(PdfGraphics g, BasicShape image) { }
        private static void Draw(PdfGraphics g, Box box) { }
        private static void Draw(PdfGraphics g, Cell box) {
            Draw(g, box as TextBlock);
        }
        private static void Draw(PdfGraphics g, CheckBox box) { }
        private static void Draw(PdfGraphics g, Ellipse box) { }
        private static void Draw(PdfGraphics g, FBImage box) { }
        private static void Draw(PdfGraphics g, FBTextBlock textBlock)
        {
            if (m_doc == null) return;

            Draw(g, textBlock.TextBlock);
        }
        private static void Draw(PdfGraphics g, Table box) {
            var grid = new PdfGrid();

            foreach (var cell in box.Cells)
            {
                Draw(g, cell["header"]);
                Draw(g, cell["content"]);
            }
        }


        private static void Draw(PdfGraphics g, TextBlock box)
        {
            foreach(var binding in box.Bindings.Select(b => b.Value))
            {
                string realValue = "";
                object obj = m_invoice;
                
                foreach(var part in binding.Value.Split('.'))
                {
                    bool gotInInvoice = (obj is Invoice);

                    if(obj is Invoice)
                    {
                        if (part == "Total")
                        {
                            obj = (obj as Invoice).GetTotal();
                        }
                        else if (part == "Due")
                        {
                            obj = (obj as Invoice).GetDue();
                        }
                        else if (part == nameof(MiscellaneousFee))
                        {
                            obj = (obj as Invoice).Fees[0];
                        }
                        else if (part == nameof(Payment))
                        {
                            obj = (obj as Invoice).Payments[0];
                        }
                        else if (part == nameof(VehicleInfo))
                        {
                            obj = (obj as Invoice).Vehicles[0];
                        }
                        else gotInInvoice = false;
                    }

                    if (!gotInInvoice && part.EndsWith("]"))
                    {
                        //object[] index = new object[] { Regex.Match(part, @"\[(.*?)\]").Groups[1].Value };
                        //string baseName = Regex.Replace(part, @"(\[.*?\])", "");
                        //obj = obj.GetType().GetRuntimeProperty(baseName).GetValue(obj, index);
                    }
                    else if(!gotInInvoice)
                    {
                        obj = obj.GetType().GetRuntimeProperty(part).GetValue(obj, null);
                    }
                }

                realValue = obj.ToString();

                box.Text = box.Text.Replace("|_" + binding.Id + "_|", realValue);
            }

            var brush = new PdfSolidBrush(new PdfColor(GetColor(box.Font.Color)));
            var font = new Font();
            font.Bold = box.Font.Bold;
            font.Italic = box.Font.Italic;
            font.FontFamilyName = box.Font.Family;
            font.SizeInPoints = (float)box.Font.Size;
            //PdfFont pdfFont = new PdfTrueTypeFont(font, font.Size);
            PdfFont pdfFont = new PdfStandardFont(PdfFontFamily.Helvetica, font.Size);

            double? height = box.AutoHeight ? (double?)null : box.Layout.Height;
            double? width = box.AutoWidth ? (double?)null : box.Layout.Width;

            var textProps = GetTextProperties(box.Text, width, height, pdfFont);

            if (box.AutoHeight) box.Layout.Height = textProps.Height + box.Layout.Padding.Top + box.Layout.Padding.Bottom;
            if (box.AutoWidth) box.Layout.Width = textProps.Width + box.Layout.Padding.Left + box.Layout.Padding.Right;

            double lineHeight = box.Font.Size * Constants.WYSIWYG_FLH_RATIO;
            double yShiftAmt = box.Layout.Padding.Top; /// Should already be correct from web-side

            if (box.VerticallyCenter)
            {
                var realHeight = box.Layout.Height - box.Layout.Padding.Top - box.Layout.Padding.Bottom;
                yShiftAmt += (realHeight - textProps.Height) / 2;
            }

            PdfStringFormat textSettings;
            if(box.Font.Alignment == "Center") textSettings = new PdfStringFormat(PdfTextAlignment.Center);
            else if(box.Font.Alignment == "Right") textSettings = new PdfStringFormat(PdfTextAlignment.Right);
            else textSettings = new PdfStringFormat(PdfTextAlignment.Left);

            var xPos = (float)(box.Layout.X + box.Layout.Padding.Left);
            if (textSettings.Alignment == PdfTextAlignment.Center) xPos = (float)(box.Layout.X + (box.Layout.Width / 2));
            else if (textSettings.Alignment == PdfTextAlignment.Right) xPos = (float)(box.Layout.X + box.Layout.Width - box.Layout.Padding.Right);

            for (var lineIdx = 0; lineIdx < textProps.TextLines.Count; ++lineIdx)
            {
                var line = textProps.TextLines[lineIdx];
                float yPos = (float)((lineIdx * lineHeight) + yShiftAmt + box.Layout.Y);
                g.DrawString(line, pdfFont, brush, new PointF(xPos, yPos), textSettings);
            }
        }


        private static void DrawMain(PdfGraphics g, FBObject obj) { }

        private static Color GetColor(string hex)
        {
            hex = hex.Trim('#');

            var parts = Enumerable.Range(0, hex.Length)
                                  .Where(x => x % 2 == 0)
                                  .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                                  .ToArray();

            if (parts.Length != 3) throw new ArgumentException("Invalid HEX code");

            return Color.FromArgb(parts[0], parts[1], parts[2]);
        }
        
        private static TextProperties GetTextProperties(string text, double? width, double? height, PdfFont font)
        {
            float calcWidth = 0;  // Holds what we calculated the width to be for a given line
            float calcHeight = 0; // Holds what we calculated the height to be
            float maxWidth = 0;   // Holds the maximum line width we find

            var outputText = new List<string>(); // Holds the lines of text to be returned
            string tempLine = "";   // Holds the line being measured

            // Hold a dash as a [255] character
            string dash255 = "-" + Convert.ToChar(255);

            // Hold the regex to find either a [space] or [255] character, globally
            Regex space255reg = new Regex($"[ {Convert.ToChar(255)}]");

            // Replace - with [255], and split by [space] and [space] and [255] to preserve -'s.
            // This makes us be able to keep words together, and break on the dashes.
            var lines = text.Split('\n');

            // The current word we're on
            var wordStartIdx = 0;
            var lineIdx = 0;

            // Start with the first line as the words
            var words = space255reg.Split(Regex.Replace(lines[lineIdx], "-", dash255));

            // While we either don't have a height, or while the number of lines we have has not exceeded the height
            while (height == null || calcHeight < height)
            {

                calcWidth = 0; // Start width a width of zero
                tempLine = ""; // And no text in the line
                var wordEndIdx = wordStartIdx; // Adjust the end index so when we ++ it will be the word after the start

                // If no width restriction
                if (width == null)
                {
                    // Push all but the last line back
                    for (var i = 0; i < lines.Length - 1; ++i) outputText.Add(lines[i]);

                    // Use the last line as the line to be pushed later
                    tempLine = lines[lines.Length - 1];
                    wordEndIdx = words.Length;
                    lineIdx = lines.Length;
                }
                else
                {
                    // While we haven't reached the end of the words
                    while (wordEndIdx < words.Length)
                    {
                        // Get the [startWord] to [endWord], and join them with spaces, then
                        // remove spaces after hyphens, since the hyphen is what we originally
                        // split on
                        var wordConcat = string.Join(" ", words, wordStartIdx, ++wordEndIdx - wordStartIdx);
                        wordConcat = Regex.Replace(wordConcat, "- ", "-");

                        // Measure how long the string of words is
                        calcWidth = font.MeasureString(wordConcat).Width;

                        // If we didn't exceed the width, then, remember what we have so far
                        if (calcWidth <= width)
                        {
                            tempLine = wordConcat;
                        }
                        // Otherwise, back up the last word (so it will be the starting word next time) and stop processing
                        else
                        {
                            --wordEndIdx;
                            break;
                        }
                    }
                }

                // If we didn't get any text back, then there wasn't enough width for one word, so stop processing
                if (tempLine == "") break;

                // Determine if this line is longer than the last max
                maxWidth = Math.Max(maxWidth, font.MeasureString(tempLine).Width);

                // Add the line to the array of lines
                outputText.Add(tempLine);

                // Set the starting word for next time to be the word after the one we ended width
                // (No, it shouldn't have a +1, it's how the slice method works)
                wordStartIdx = wordEndIdx;

                // Calculate how high we are now
                calcHeight = (float)(font.Size + ((font.Size * Constants.WYSIWYG_FLH_RATIO) * (outputText.Count - 1)));

                // If we've gotten too tall, remove the last element we added, and stop processing
                if (calcHeight > height)
                {
                    outputText.RemoveAt(outputText.Count - 1);

                    // Recalculate the height
                    calcHeight = (float)(font.Size + ((font.Size * Constants.WYSIWYG_FLH_RATIO) * (outputText.Count - 1)));

                    break;
                }
                // Otherwise, If we've reached the end
                else if (wordEndIdx >= words.Length)
                {
                    // If there's another line, go to that, otherwise stop processing
                    if (lineIdx < lines.Length - 1)
                    {
                        ++lineIdx;
                        words = space255reg.Split(Regex.Replace(lines[lineIdx], "-", dash255));
                        wordStartIdx = wordEndIdx = 0;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            // Ensure not a decimal; Go up so not too small
            calcHeight = (float)Math.Ceiling(calcHeight);

            // Return what we got
            return new TextProperties {
                Width = maxWidth,
                Height = calcHeight,
                TextLines = outputText
            };
        }

    }

    class TextProperties
    {
        public float Height { get; set; }
        public float Width { get; set; }

        public List<string> TextLines { get; set; }
    }
}
