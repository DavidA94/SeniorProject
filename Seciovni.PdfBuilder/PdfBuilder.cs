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
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Seciovni.PdfBuilder
{
    public class PdfBuilder
    {
        #region Dealer Phone Numbers and Addresses

        private static Dictionary<InvoiceState, Tuple<string, Address>> m_dealer = new Dictionary<InvoiceState, Tuple<string, Address>> {

            { InvoiceState.Arizona,
                Tuple.Create(
                    "1-800-769-2979",
                    new Address()
                    {
                        StreetAddress = "5601 W. Buckeye Rd.",
                        City = "Phoenix",
                        State = "AZ",
                        ZipCode = "85043"
                    }
                )
            },
            { InvoiceState.California,
                Tuple.Create(
                    "1-800-801-0836",
                    new Address()
                    {
                        StreetAddress = "4450 S. Blackstone Dr.",
                        City = "Tulare",
                        State = "CA",
                        ZipCode = "93274"
                    }
                )
            },
            { InvoiceState.Georgia,
                Tuple.Create(
                    "1-855-266-4913",
                    new Address()
                    {
                        StreetAddress = "4275 Shirley Dr.",
                        City = "Atlanta",
                        State = "GA",
                        ZipCode = "30336"
                    }
                )
            },
            { InvoiceState.Illinois,
                Tuple.Create(
                    "1-866-544-1212",
                    new Address()
                    {
                        StreetAddress = "3301 W. Mount Rd.",
                        City = "Joliet",
                        State = "IL",
                        ZipCode = "60436"
                    }
                )
            }
        };

        #endregion

        private PdfDocument m_doc = null;
        private Invoice m_invoice = null;
        private int m_curPage = 0;
        private double m_globalShift = 0;
        private int? m_curVehicle = null;

        public string Generate(IEnumerable<FormBuilder> forms, Invoice invoice)
        {
            m_invoice = invoice;

            m_doc = new PdfDocument();
            m_doc.DocumentInformation.Title = invoice.InvoiceDate.ToString("yyyy-MM-dd") + " " + invoice.Buyer.User.FullName() + " Invoice";
            m_doc.PageSettings.SetMargins(0f, 0f, 0f, 0f);
            m_doc.PageSettings.Size = new SizeF(Constants.WYSIWYG_PPI * 8.5f, Constants.WYSIWYG_PPI * 11f);

            float margin = 0.25f * Constants.WYSIWYG_PPI;

            foreach (var form in forms)
            {
                float height = (form.Canvas.Orientation == Orientation.PORTRAIT
                                ? Constants.WYSIWYG_PAGE_HEIGHT
                                : Constants.WYSIWYG_PAGE_WIDTH) - margin;

                float width = form.Canvas.Orientation == Orientation.LANDSCAPE
                                ? Constants.WYSIWYG_PAGE_HEIGHT
                                : Constants.WYSIWYG_PAGE_WIDTH;

                var count = (form.Canvas.DocType == DocumentType.ONE_PER_INV ? 1 : invoice.Vehicles.Count);

                for (int i = 0; i < count; ++i)
                {
                    ++m_curPage;
                    PdfPage page = m_doc.Pages.Add();
                    var savedState = page.Graphics.Save();

                    // Set or clear the cur vehicle
                    m_curVehicle = (form.Canvas.DocType == DocumentType.ONE_PER_VEH ? (int?)i : null);

                    var shapes = form.Canvas.Shapes.OrderBy(s => s.Layout.Y).ToList();
                    for (int shapeIdx = 0; shapeIdx < shapes.Count; ++shapeIdx)
                    {
                        dynamic shape = shapes[shapeIdx];

                        // If we've passed the bottom of the page, due to shifting from the global offset
                        var fbObj = (shape as FBObject);
                        if (fbObj.Layout.Y + fbObj.Layout.Height + m_globalShift > height &&
                            fbObj.Layout.Y + fbObj.Layout.Height <= height)
                        {
                            // Draw and duplicate anything that's made to go below (footer)
                            var footerShapes = shapes.Where(s => s.Layout.Y + s.Layout.Height > height).ToList();

                            // Make sure things aren't shifted
                            var backupState = page.Graphics.Save();
                            page.Graphics.Restore(savedState);

                            foreach (dynamic footerObj in footerShapes)
                            {
                                // Remove and add so it's not printed twice on new runs
                                shapes.Remove(footerObj as FBObject);
                                shapes.Add(footerObj as FBObject);
                                Draw(page.Graphics, footerObj);
                                DrawMain(page.Graphics, footerObj);
                            }

                            // This shouldn't matter, but JIC, restore the state of what it was before
                            page.Graphics.Restore(backupState);

                            ++m_curPage;
                            page = m_doc.Pages.Add();
                            savedState = page.Graphics.Save();

                            // Need to shift everything up now\
                            m_globalShift = margin - fbObj.Layout.Y;
                            page.Graphics.TranslateTransform(0f, (float)m_globalShift);
                        }
                        // Otherwise, if we are meant to be at the bottom, then some restoration needs to happen
                        else if (fbObj.Layout.Y + fbObj.Layout.Height > height)
                        {
                            var backupState = page.Graphics.Save();
                            page.Graphics.Restore(savedState);

                            Draw(page.Graphics, shape);
                            DrawMain(page.Graphics, shape);

                            page.Graphics.Restore(backupState);

                            // Make sure we don't draw twice
                            continue;
                        }

                        Draw(page.Graphics, shape);
                        DrawMain(page.Graphics, shape);
                    }
                }
            }

            string tempFilePath = Path.GetTempPath();
            string fileName = Path.Combine(tempFilePath, $"Invoice {invoice.InvoiceID} - {invoice.Buyer.User.FullName()}.pdf");
            using (MemoryStream stream = new MemoryStream())
            {
                m_doc.Save(stream);

                File.WriteAllBytes(fileName, stream.ToArray());
            }

            m_doc = null;
            m_invoice = null;

            return fileName;
        }

        private void Draw(PdfGraphics g, BasicShape box)
        {
            if (box.Shape.ShapeName == nameof(Box))
            {
                var boxX = (float)box.Layout.X;
                var boxY = (float)box.Layout.Y;
                var boxH = (float)box.Layout.Height;
                var boxW = (float)box.Layout.Width;
                var marginL = (float)box.Layout.Margin.Left;
                var marginT = (float)box.Layout.Margin.Top;

                var background = new PdfSolidBrush(new PdfColor(GetColor(box.Appearance.Background)));
                var stroke = new PdfPen(new PdfColor(GetColor(box.Appearance.StrokeColor)), (float)box.Appearance.StrokeThickness);

                g.DrawRectangle(background, boxX + marginL, boxY + marginT, boxW, boxH);
                g.DrawRectangle(stroke, boxX + marginL, boxY + marginT, boxW, boxH);
            }
            else
            {
                // TODO
            }
        }
        private void Draw(PdfGraphics g, Cell box)
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
        private void Draw(PdfGraphics g, CheckBox box)
        {
            var scaleAmt = Math.Min(box.Layout.Width, box.Layout.Height) / 10.0;
            var cornerAmt = (float)(2 * scaleAmt);
            var lineWidth = scaleAmt;

            var x = box.Layout.X;
            var y = box.Layout.Y;
            var width = box.Layout.Width - lineWidth;
            var height = box.Layout.Height - lineWidth;

            var shiftX = 0.0;
            var shiftY = 0.0;

            if (width > height)
            {
                shiftX = (width - height) / 2;
                width = height;
            }

            if (width < height)
            {
                shiftY = (height - width) / 2.0;
                height = width;
            }

            shiftX += x + (lineWidth / 2);
            shiftY += y + (lineWidth / 2);

            var pen = new PdfPen(PdfBrushes.Black, (float)lineWidth);
            g.DrawRectangle(pen, (float)x, (float)y, (float)width, (float)height);

            pen = new PdfPen(PdfBrushes.Black, (float)lineWidth * 1.5f);
            g.DrawLine(pen, (float)(x + width * 0.2), (float)(y + height * 0.57),
                            (float)(x + width * 0.4), (float)(y + height * 0.77));
            g.DrawLine(pen, (float)(x + width * 0.4), (float)(y + height * 0.77),
                            (float)(x + width * 0.8), (float)(y + height * 0.27));
        }
        private void Draw(PdfGraphics g, Ellipse box) { }
        private void Draw(PdfGraphics g, FBImage box)
        {
            using (var stream = new FileStream(Path.Combine(Constants.API_ROOT_IMG_FOLDER, box.ImgSrc), FileMode.Open))
            {
                using (var bitmap = new PdfBitmap(stream))
                {
                    var width = box.Layout.Width;
                    var height = box.Layout.Height;

                    if (box.PreserveRatio)
                    {
                        height = bitmap.Height * (width / bitmap.Width);

                        // If we went the wrong way
                        if (height > box.Layout.Height)
                        {
                            height = box.Layout.Height;
                            width = bitmap.Width * (height / bitmap.Height);
                        }
                    }

                    g.DrawImage(bitmap, new PointF((float)box.Layout.X, (float)box.Layout.Y), new SizeF((float)width, (float)height));
                }
            }
        }
        private void Draw(PdfGraphics g, FBTextBlock textBlock)
        {
            if (m_doc == null) return;

            Draw(g, textBlock.TextBlock);
        }
        private void Draw(PdfGraphics g, Table box)
        {
            var headers = box.Cells.Select(c => c["header"]);
            var contents = box.Cells.Select(c => c["content"]).ToList();

            // Figure out what we're bound to
            var cellContent = contents.FirstOrDefault(cell => cell.Bindings.Count > 0);
            var bindingPart = cellContent.Bindings.First().Value.Value.Split('.').First();
            int count = 0;

            if (bindingPart == nameof(VehicleInfo)) count = m_invoice.Vehicles.Count;
            else if (bindingPart == nameof(MiscellaneousFee)) count = m_invoice.Fees.Count;
            else if (bindingPart == nameof(Payment)) count = m_invoice.Payments.Count;

            // If there's no content, then don't draw anything
            if (count == 0)
            {
                var shiftAmt = box.HeaderHeight + box.ContentHeight;
                m_globalShift -= shiftAmt;
                g.TranslateTransform(0f, -(float)shiftAmt);
                return;
            }

            foreach (var header in headers)
            {
                Draw(g, header);
            }

            // Store the original bindings so we can revert
            var originalBindings = contents.SelectMany(c => c.Bindings.Select(kv => kv.Value.Value)).ToList();
            for (int i = 0; i < count; ++i)
            {
                if (i > 0)
                {
                    g.TranslateTransform(0, (float)box.ContentHeight);
                    m_globalShift += box.ContentHeight;
                }
                for (int cellIdx = 0; cellIdx < contents.Count; ++cellIdx)
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


        private void Draw(PdfGraphics g, TextBlock box)
        {
            // Do this so we don't change the actual object being passed in when there are bindings
            string boxText = ProcessBindings(box.Text, box.Bindings.Select(b => b.Value));

            var brush = new PdfSolidBrush(new PdfColor(GetColor(box.Font.Color)));


            string fontStyle = "";
            if (box.Font.Bold) fontStyle += "b";
            if (box.Font.Italic) fontStyle += "i";

            string fontFile = Path.Combine(Directory.GetCurrentDirectory(), "Fonts", box.Font.Family, fontStyle + ".ttf");
            if (!File.Exists(fontFile)) fontFile = Path.Combine(Directory.GetCurrentDirectory(), "Fonts", box.Font.Family, ".ttf");

            Stream fontStream = new FileStream(fontFile, FileMode.Open, FileAccess.Read);
            PdfFont pdfFont = new PdfTrueTypeFont(fontStream, (float)box.Font.Size);

            double? width = box.AutoWidth ? (box.MaxWidth > 0 ? box.MaxWidth : null) : box.Layout.Width;
            double? height = box.AutoHeight ? (box.MaxHeight > 0 ? box.MaxHeight : null) : box.Layout.Height;

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


        private void DrawMain(PdfGraphics g, FBObject obj)
        {
            if (!string.IsNullOrWhiteSpace(obj.Caption.TextBlock.Text) && obj.Caption.Location != Location.None)
            {
                // Since I don't plan to fix captioning, this should take care of things for demos
                Draw(g, obj.Caption.TextBlock);
            }

            DrawBorder(g, obj);
        }

        private void DrawBorder(PdfGraphics g, FBObject obj)
        {
            // Store the needed properties in local variables for easy access
            var topThickness = obj.Border.Thickness.Top;
            var rightThickness = obj.Border.Thickness.Right;
            var bottomThickness = obj.Border.Thickness.Bottom;
            var leftThickness = obj.Border.Thickness.Left;
            var x = obj.Layout.X;
            var y = obj.Layout.Y;
            var height = obj.Layout.Height;
            var width = obj.Layout.Width;

            // Create a brush with the right color
            PdfBrush fill = new PdfSolidBrush(new PdfColor(GetColor(obj.Border.Color)));

            /**
            ** The following four if statements work with the following logic:
            ** If the border has a size, figure out the size it should be
            ** The size includes the size of neighboring border. Such that,
            ** if there is a top and right border, the top's width will be
            ** extended so that it goes all the way to the right of the right
            ** border, and the right's height and y position will be adjusted
            ** so that the right border will go to the top of the top border.
            ** This is a little redundant, But it keeps all the logic the same.
            ** Might change it someday.
            ** Then a rectangle is drawn to represent the border
            */

            if (topThickness > 0)
            {
                var bY = (float)(y - topThickness);
                var bX = (float)(x - leftThickness);
                var bW = (float)(width + leftThickness + rightThickness);

                g.DrawRectangle(fill, bX, bY, bW, (float)topThickness);
            }

            if (rightThickness > 0)
            {
                var bX = (float)(x + width);
                var bY = (float)(y - topThickness);
                var bH = (float)(height + topThickness + bottomThickness);

                g.DrawRectangle(fill, bX, bY, (float)rightThickness, bH);
            }

            if (bottomThickness > 0)
            {
                var bY = (float)(y + height);
                var bX = (float)(x - leftThickness);
                var bW = (float)(width + leftThickness + rightThickness);

                g.DrawRectangle(fill, bX, bY, bW, (float)bottomThickness);
            }

            if (leftThickness > 0)
            {
                var bX = (float)(x - leftThickness);
                var bY = (float)(y - topThickness);
                var bH = (float)(height + topThickness + bottomThickness);

                g.DrawRectangle(fill, bX, bY, (float)leftThickness, bH);
            }
        }

        private Color GetColor(string hex)
        {
            hex = hex.Trim('#');

            var parts = Enumerable.Range(0, hex.Length)
                                  .Where(x => x % 2 == 0)
                                  .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                                  .ToArray();

            if (parts.Length != 3) throw new ArgumentException("Invalid HEX code");

            return Color.FromArgb(parts[0], parts[1], parts[2]);
        }

        private RectangleF GetRectangle(Layout layout)
        {
            return new RectangleF((float)layout.X, (float)layout.Y, (float)layout.Width, (float)layout.Height);
        }

        private TextProperties GetTextProperties(string text, double? width, double? height, PdfFont font)
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
        
        private string ProcessBindings(string text, IEnumerable<Binding> bindingValues)
        {
            foreach (var binding in bindingValues)
            {
                string realValue = GetInvoiceValueFromPath(m_invoice, binding.Value, m_curPage, m_curVehicle, true);
                text = text.Replace("|_" + binding.Id + "_|", realValue);
            }

            return text;
        }

        /// <summary>
        /// Gets the value from an invoice
        /// </summary>
        /// <param name="inv">The invoice to get the value from</param>
        /// <param name="path">The path to the invoice value</param>
        /// <param name="pageNumber">The page number to use</param>
        /// <param name="vehicleIdx">The vehicle index to use</param>
        /// <param name="autoFormat">Indicates if values should be auto-formatted</param>
        /// <returns>The invoice's value for the given field</returns>
        /// <remarks>
        /// This doesn't really belong here, but it uses things from both Database and Shared, which would
        /// casue a recursive reference, so can't do that...
        /// </remarks>
        public static string GetInvoiceValueFromPath(Invoice inv, string path, int pageNumber = 0, int? vehicleIdx = 0, bool autoFormat = true)
        {
            object obj = inv;

            var parts = path.Split('.');
            foreach (var part in parts)
            {
                if (obj is Invoice)
                {
                    if (part == "Total")
                    {
                        if (autoFormat)
                        {
                            obj = Format.ForPrint(new PrintFormatAttribute() { FixedPlaces = 2, Prefix = "$ " }, (obj as Invoice).GetTotal());
                        }
                        else
                        {
                            obj = inv.GetTotal();
                        }
                        break;
                    }
                    else if (part == "Due")
                    {
                        if (autoFormat)
                        {
                            obj = Format.ForPrint(new PrintFormatAttribute() { FixedPlaces = 2, Prefix = "$ " }, (obj as Invoice).GetDue());
                        }
                        else
                        {
                            obj = inv.GetDue();
                        }
                        break;
                    }
                    else if (part == "PageNumber")
                    {
                        obj = pageNumber;
                        break;
                    }
                    else if (part == "StreetAddress")
                    {
                        obj = m_dealer[inv.State].Item2.StreetAddress;
                        break;
                    }
                    else if (part == "City")
                    {
                        obj = m_dealer[inv.State].Item2.City;
                        break;
                    }
                    else if (part == "CompanyState")
                    {
                        obj = m_dealer[inv.State].Item2.State;
                        break;
                    }
                    else if (part == "ZIP")
                    {
                        obj = m_dealer[inv.State].Item2.ZipCode;
                        break;
                    }
                    else if (part == "PhoneNumber")
                    {
                        obj = m_dealer[inv.State].Item1;
                        break;
                    }
                    // Special case for when doing a page per vehicle
                    else if (part == nameof(VehicleInfo) && vehicleIdx != null)
                    {
                        obj = (obj as Invoice).Vehicles.ElementAt((int)vehicleIdx);
                        continue;
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

                    if (autoFormat)
                    {
                        obj = Format.ForPrint(format, pi.GetValue(obj));
                    }
                    else
                    {
                        obj = pi.GetValue(obj);
                    }
                }
                else
                {
                    obj = obj.GetType().GetRuntimeProperty(part).GetValue(obj, null);
                }
            }

            return obj.ToString();
        }
    }

    class TextProperties
    {
        public float Height { get; set; }
        public float Width { get; set; }

        public List<string> TextLines { get; set; }
    }
}
