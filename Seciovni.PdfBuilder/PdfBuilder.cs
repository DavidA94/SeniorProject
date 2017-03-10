using Database.Tables;
using Shared;
using Shared.CustomFormatters;
using Shared.FormBuilderObjects;
using Shared.FormBuilderObjects.FBObjects;
using Shared.FormBuilderObjects.FBObjects.Bases;
using Shared.FormBuilderObjects.Properties;
using Syncfusion.Drawing;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using Syncfusion.Pdf.Grid;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Seciovni.PdfBuilder
{
    public static class PdfBuilder
    {
        private static PdfDocument m_doc = null;
        private static Invoice m_invoice = null;
        private static double m_globalShift = 0;

        public static void Generate(FormBuilder fb, Invoice invoice)
        {
            m_invoice = invoice;

            m_doc = new PdfDocument();
            m_doc.DocumentInformation.Title = invoice.InvoiceDate.ToString("YYYY-mm-dd") + " " + invoice.Buyer.User.FullName() + " Invoice";
            m_doc.PageSettings.SetMargins(0f);

            PdfPage page = m_doc.Pages.Add();
            

            //for(float i = 590, y = 20; i < 610; i += 1, y += 20)
            //{
            //    page.Graphics.DrawLine(PdfPens.Black, 0, y, i, y);
            //    page.Graphics.DrawString(i.ToString(), new PdfStandardFont(PdfFontFamily.Courier, 12), PdfPens.Black, i - 5, y, 
            //        new PdfStringFormat(PdfTextAlignment.Right));
            //}

            //using (MemoryStream stream = new MemoryStream())
            //{
            //    m_doc.Save(stream);

            //    File.WriteAllBytes("Test.pdf", stream.ToArray());
            //}

            //return;

            foreach (dynamic shape in fb.Canvas.Shapes)
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
        private static void Draw(PdfGraphics g, Cell box)
        {
            float borderSize = 0.75f;
            float shiftAmt = borderSize / 2.0f;

            PdfBrush background = new PdfSolidBrush(new PdfColor(GetColor(box.Background)));
            PdfPen border = new PdfPen(new PdfColor(GetColor(box.BorderColor)), borderSize);

            g.DrawRectangle(background, GetRectangle(box.Layout));
            Draw(g, box as TextBlock);

            // Make the stroke be half in, half out
            var borderRect = GetRectangle(box.Layout);
            g.DrawRectangle(border, borderRect);
        }
        private static void Draw(PdfGraphics g, CheckBox box) { }
        private static void Draw(PdfGraphics g, Ellipse box) { }
        private static void Draw(PdfGraphics g, FBImage box) { }
        private static void Draw(PdfGraphics g, FBTextBlock textBlock)
        {
            if (m_doc == null) return;

            Draw(g, textBlock.TextBlock);
        }
        private static void Draw(PdfGraphics g, Table box)
        {
            var grid = new PdfGrid();
            var headers = box.Cells.Select(c => c["header"]);
            var contents = box.Cells.Select(c => c["content"]).ToList();

            foreach (var header in headers)
            {
                Draw(g, header);
            }

            // Figure out what we're bound to
            var cellContent = contents.FirstOrDefault(cell => cell.Bindings.Count > 0);
            var bindingPart = cellContent.Bindings.First().Value.Value.Split('.').First();
            int count = 0;

            if (bindingPart == nameof(VehicleInfo)) count = m_invoice.Vehicles.Count;
            else if (bindingPart == nameof(MiscellaneousFee)) count = m_invoice.Fees.Count;
            else if (bindingPart == nameof(Payment)) count = m_invoice.Payments.Count;

            // Store the original bindings so we can revert
            var originalBindings = contents.SelectMany(c => c.Bindings.Select(kv => kv.Value.Value)).ToList();

            for(int i = 0; i < count; ++i)
            {
                if (i > 0)
                {
                    g.TranslateTransform(0, (float)box.ContentHeight);
                }

                for(int cellIdx = 0; cellIdx < contents.Count; ++cellIdx)
                {
                    var cell = contents[cellIdx];

                    foreach (var kv in cell.Bindings)
                    {
                        kv.Value.Value = originalBindings[cellIdx].Replace(bindingPart, $"{bindingPart}[{i}]");
                    }

                    Draw(g, cell);
                }
            }

            //foreach (var cell in box.Cells) {
            //    Draw(g, cell["content"]);
            //}
        }


        private static void Draw(PdfGraphics g, TextBlock box)
        {
            // Do this so we don't change the actual object being passed in when there are bindings
            string boxText = box.Text;

            foreach (var binding in box.Bindings.Select(b => b.Value))
            {
                string realValue = "";
                object obj = m_invoice;

                var parts = binding.Value.Split('.');
                foreach (var part in parts)
                {
                    if (obj is Invoice)
                    {
                        if (part == "Total")
                        {
                            obj = Format.ForPrint(new PrintFormatAttribute() { FixedPlaces = 2, Prefix = "$ " }, (obj as Invoice).GetTotal());
                            break;
                        }
                        else if (part == "Due")
                        {
                            obj = Format.ForPrint(new PrintFormatAttribute() { FixedPlaces = 2, Prefix = "$ " }, (obj as Invoice).GetDue());
                            break;
                        }
                        // If we've hit one of the arrays
                        else if (part.EndsWith("]"))
                        {
                            // We'll assume there's no bad data, until it blows up
                            var index = Convert.ToInt32(Regex.Match(part, "(\\d+)").Groups[1].Value);
                            var name = part.Substring(0, part.IndexOf('['));

                            if (name == nameof(MiscellaneousFee))
                            {
                                obj = (obj as Invoice).Fees.ElementAt(index);
                                continue;
                            }
                            else if (name == nameof(Payment))
                            {
                                obj = (obj as Invoice).Payments.ElementAt(index);
                                continue;
                            }
                            else if (name == nameof(VehicleInfo))
                            {
                                obj = (obj as Invoice).Vehicles.ElementAt(index);
                                continue;
                            }
                        }
                    }

                    if (part == parts.Last())
                    {
                        var pi = obj.GetType().GetRuntimeProperty(part);
                        var format = pi.GetCustomAttribute<PrintFormatAttribute>();
                        obj = Format.ForPrint(format, pi.GetValue(obj, null));
                    }
                    else
                    {
                        obj = obj.GetType().GetRuntimeProperty(part).GetValue(obj, null);
                    }
                }

                realValue = obj.ToString();

                boxText = boxText.Replace("|_" + binding.Id + "_|", realValue);
            }

            var brush = new PdfSolidBrush(new PdfColor(GetColor(box.Font.Color)));


            string fontStyle = "";
            if (box.Font.Bold) fontStyle += "b";
            if (box.Font.Italic) fontStyle += "i";

            string fontFile = Path.Combine(Directory.GetCurrentDirectory(), "Fonts", box.Font.Family, fontStyle + ".ttf");
            if (!File.Exists(fontFile)) fontFile = Path.Combine(Directory.GetCurrentDirectory(), "Fonts", box.Font.Family, ".ttf");

            Stream fontStream = new FileStream(fontFile, FileMode.Open, FileAccess.Read);
            PdfFont pdfFont = new PdfTrueTypeFont(fontStream, (float)box.Font.Size);

            double? height = box.AutoHeight ? (double?)null : box.Layout.Height;
            double? width = box.AutoWidth ? (double?)null : box.Layout.Width;

            var textProps = GetTextProperties(boxText, width, height, pdfFont);

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
            if (box.Font.Alignment == "Center") textSettings = new PdfStringFormat(PdfTextAlignment.Center);
            else if (box.Font.Alignment == "Right") textSettings = new PdfStringFormat(PdfTextAlignment.Right);
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


        private static void DrawMain(PdfGraphics g, FBObject obj)
        {
            if (!string.IsNullOrWhiteSpace(obj.Caption.TextBlock.Text) && obj.Caption.Location != Location.None)
            {
                // Since I don't plan to fix captioning, this should take care of things for demos
                Draw(g, obj.Caption.TextBlock);
            }
        }

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

        private static RectangleF GetRectangle(Layout layout)
        {
            return new RectangleF((float)layout.X, (float)layout.Y, (float)layout.Width, (float)layout.Height);
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
            return new TextProperties
            {
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
