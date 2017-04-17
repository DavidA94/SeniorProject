using Database.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.Contracts;
using Seciovni.APIs.Shared;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.Extensions;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Http;
using Newtonsoft.Json;

namespace Seciovni.APIs.Controllers
{
    [Route("api/[controller]")]
    public class SearchController : ApiController
    {
        private SeciovniContext db;

        public SearchController(SeciovniContext context)
        {
            db = context;
        }

        [HttpGet(nameof(SearchFields))]
        public IEnumerable<BindingOptionData> SearchFields()
        {
            if (Request.HasValidLogin(db) && Request.CanAccess(db, AccessPolicy.ViewInvoicePrivilege))
            {
                var fields = SharedData.GetBindingOptions(BindingOption.REPEATING).ToList();
                fields.InsertRange(0, SharedData.GetBindingOptions(BindingOption.SINGLE));
                return fields;
            }

            return null;
        }

        [HttpGet(nameof(Search))]
        public IEnumerable<SearchResult> Search()
        {
            const string DATE_FORMAT = "yyyy-MM-dd";

            if (Request.HasValidLogin(db) && Request.CanAccess(db, AccessPolicy.ViewInvoicePrivilege))
            {
                // Need to do it this way -- Can't figure out why it won't bind using [FromUri]
                var searchTerms = JsonConvert.DeserializeObject<IEnumerable<SearchTerm>>(Uri.UnescapeDataString(Request.RequestUri.Query.Trim('?')));
                if (searchTerms.Count(t => !string.IsNullOrWhiteSpace(t.InvoiceField)) == 0) return null;

                // Get everything so we don't have to ask again
                var dbInvoices = db.Invoices
                                   .Include(i => i.Buyer).ThenInclude(b => b.Address)
                                   .Include(i => i.Buyer).ThenInclude(b => b.User)
                                   .Include(i => i.Fees)
                                   .Include(i => i.LienHolder).ThenInclude(l => l.Address)
                                   .Include(i => i.Payments)
                                   .Include(i => i.SalesPerson).ThenInclude(sp => sp.User)
                                   .Include(i => i.Vehicles);

                var results = new List<Tuple<Invoice, double, Dictionary<string, string>>>();
                var invValues = new Dictionary<string, string>();

                foreach (var invoice in dbInvoices)
                {
                    bool isRangeMatch = true;
                    var chances = new List<double>();

                    // Loop through the terms that aren't empty
                    foreach (var term in searchTerms.Where(t => !string.IsNullOrWhiteSpace(t.InvoiceField)))
                    {
                        // Pull the first part of the term, so we can check if it's an array
                        string arrayPart = term.InvoiceField.Split('.').First();
                        int numItems = 0;

                        // Figure out how many items are in the array
                        if (arrayPart == nameof(MiscellaneousFee)) numItems = invoice.Fees.Count;
                        else if (arrayPart == nameof(Payment)) numItems = invoice.Payments.Count;
                        else if (arrayPart == nameof(VehicleInfo)) numItems = invoice.Vehicles.Count;
                        else  arrayPart = null;

                        // If this is a range search
                        if (term.TermRange != null)
                        {
                            // If it's a date search
                            if (term.InvoiceField.Contains("Date"))
                            {
                                var culture = CultureInfo.InvariantCulture; // Make things shorter
                                DateTime low, high;

                                // If no term, then assume the minimum, otherwise, it must be a valid date
                                if (string.IsNullOrEmpty(term.Term)) low = DateTime.MinValue;
                                else if (!DateTime.TryParseExact(term.Term, DATE_FORMAT, culture, DateTimeStyles.None, out low))
                                {
                                    isRangeMatch = false;
                                    break;
                                }

                                // If no termRange, then assume the maximum, otherwise, it must be a valid date
                                if (string.IsNullOrWhiteSpace(term.TermRange)) high = DateTime.MaxValue;
                                else if (!DateTime.TryParseExact(term.TermRange, DATE_FORMAT, culture, DateTimeStyles.None, out high))
                                {
                                    isRangeMatch = false;
                                    break;
                                }

                                isRangeMatch = arrayPart != null ?
                                    checkRange(invoice, term.InvoiceField, low, high, arrayPart, numItems) :
                                    checkRange(invoice, term.InvoiceField, low, high);
                            }
                            else
                            {
                                double low, high;

                                // Same deal as Date stuff above, just with doubles now
                                if (string.IsNullOrWhiteSpace(term.Term)) low = double.MinValue;
                                else if (!double.TryParse(term.Term, out low))
                                {
                                    isRangeMatch = false;
                                    break;
                                }

                                if (string.IsNullOrWhiteSpace(term.TermRange)) high = double.MaxValue;
                                else if (!double.TryParse(term.TermRange, out high))
                                {
                                    isRangeMatch = false;
                                    break;
                                }

                                isRangeMatch = arrayPart != null ?
                                    checkRange(invoice, term.InvoiceField, low, high, arrayPart, numItems) :
                                    checkRange(invoice, term.InvoiceField, low, high);
                            }

                            // If we didn't match the range, then we're done here
                            if (!isRangeMatch)
                            {
                                break;
                            }
                        }
                        // Non-range search
                        else
                        {
                            var valueAndLikeliness = arrayPart != null ?
                                getValueAndLikelieness(invoice, term.InvoiceField, term.Term, arrayPart, numItems) :
                                getValueAndLikelieness(invoice, term.InvoiceField, term.Term);

                            chances.Add(valueAndLikeliness.Item2);
                            if(arrayPart == null) invValues[term.InvoiceField] = valueAndLikeliness.Item1;
                        }
                    }

                    if (isRangeMatch && (chances.Count == 0 || chances.Average() > 0.6))
                    {
                        results.Add(Tuple.Create(invoice, chances.Count == 0 ? 1 : chances.Average(), invValues));
                    }
                }

                return results.OrderByDescending(r => r.Item1.InvoiceDate)
                              .OrderByDescending(r => r.Item2)
                              .Select(r => new SearchResult()
                              {
                                  BuyerName = r.Item1.Buyer.User.FullName(),
                                  CreatedDate = r.Item1.InvoiceDate,
                                  Fees = searchTerms.Any(t => t.InvoiceField.StartsWith(nameof(MiscellaneousFee))) ? r.Item1.Fees : new List<MiscellaneousFee>(),
                                  InvoiceNumber = r.Item1.InvoiceID,
                                  OtherFields = invValues,
                                  Payments = searchTerms.Any(t => t.InvoiceField.StartsWith(nameof(Payment))) ? r.Item1.Payments : new List<Payment>(),
                                  SalesPerson = r.Item1.SalesPerson.User.FullName(),
                                  Vehicles = searchTerms.Any(t => t.InvoiceField.StartsWith(nameof(VehicleInfo))) ? r.Item1.Vehicles : new List<VehicleInfo>()
                              });
            }

            return null;
        }

        private bool checkRange(Invoice invoice, string invoiceField, double low, double high, string arrayPart = null, int numItems = 0)
        {
            Func<string, bool> checkValue = (rawValue) =>
            {
                double invValue = double.Parse(rawValue);

                // If it matches, then we're done here
                if (invValue >= low && invValue <= high)
                {
                    return true;
                }
                return false;
            };

            if (arrayPart != null)
            {
                for (int i = 0; i < numItems; ++i)
                {
                    // If the value is good, return true
                    if (checkValue(getValue(invoice, invoiceField, arrayPart, i))) return true;
                }
            }
            else
            {
                // Return if the value is within the range
                return checkValue(getValue(invoice, invoiceField));
            }

            // If we make it this far, there was no match
            return false;
        }

        private bool checkRange(Invoice invoice, string invoiceField, DateTime low, DateTime high, string arrayPart = null, int numItems = 0)
        {
            Func<string, bool> checkValue = (rawValue) =>
            {
                DateTime invValue = DateTime.ParseExact(rawValue, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                // If it matches, then we're done here
                if (invValue >= low && invValue <= high)
                {
                    return true;
                }
                return false;
            };

            if (arrayPart != null)
            {
                for (int i = 0; i < numItems; ++i)
                {
                    // If the value is good, return true
                    if (checkValue(getValue(invoice, invoiceField, arrayPart, i))) return true;
                }
            }
            else
            {
                // Return if the value is within the range
                return checkValue(getValue(invoice, invoiceField));
            }

            // If we make it this far, there was no match
            return false;
        }

        private Tuple<string, double> getValueAndLikelieness(Invoice invoice, string invoiceField, string searchString, string arrayPart = null, int numItems = 0)
        {
            Func<string, double> checkValue = (rawValue) =>
            {
                return getLikeliness(rawValue, searchString);
            };

            if (arrayPart != null)
            {
                var likelinesses = new List<Tuple<string, double>>();
                for (int i = 0; i < numItems; ++i)
                {
                    var value = getValue(invoice, invoiceField, arrayPart, i);
                    likelinesses.Add(Tuple.Create(value, getLikeliness(value, searchString)));
                }

                // Either give back the max value, or zero if there were no elements
                return likelinesses.Count > 0 ? likelinesses.OrderByDescending(e => e.Item2).First() : Tuple.Create("", 0.0);
            }
            else
            {
                // Return if the value is within the range
                var value = getValue(invoice, invoiceField);
                return Tuple.Create(value, getLikeliness(value, searchString));
            }
        }

        private string getValue(Invoice invoice, string invoiceField, string arrayPart = null, int index = 0)
        {
            // Replace with the right index
            invoiceField = (arrayPart != null) ? invoiceField.Replace(arrayPart, $"{arrayPart}[{index}]") : invoiceField;

            // Really bad we do it this way. Meh.
            // To future self, you were too lazy to refactor this right now so it's not in PdfBuilder
            return PdfBuilder.PdfBuilder.GetInvoiceValueFromPath(invoice, invoiceField, 0, 0, false);
        }

        /// <summary>
        /// Searches the given targets for the given search string, and returns the most likely results
        /// </summary>
        /// <param name="searchTerm">The search term</param>
        /// <param name="searchTargets">What strings are being searched through</param>
        /// <returns></returns>
        /// <remarks>
        /// The <paramref name="searchTargets" /> objects will have their <see cref="object.ToString"/> method called 
        /// </remarks>
        private IEnumerable<object> search(string searchTerm, IEnumerable<object> searchTargets)
        {
            var bestMatches = new List<Tuple<object, double>>();

            foreach (var target in searchTargets)
            {
                double likeliness = getLikeliness(target.ToString(), searchTerm);
                if (likeliness > 0)
                {
                    bestMatches.Add(Tuple.Create(target, likeliness));
                }
            }

            return bestMatches.OrderBy(m => m.Item2).Select(m => m.Item1);
        }

        /// <summary>
        /// Checks how likely it is for the <paramref name="target" /> to be what is meant by the <paramref name="searchTerm" />
        /// </summary>
        /// <param name="target">The string being searched</param>
        /// <param name="searchTerm">The string that the user typed</param>
        /// <returns></returns>
        public double getLikeliness(string target, string searchTerm)
        {
            // If the searchStr is bigger than the targetStr,
            // or there is no searchStr (inverse is caught in the first one),
            // then it's not a match
            if (target.Length < searchTerm.Length || searchTerm.Length == 0) return 0;
            else if (target == searchTerm) return 1;

            // Get the if the search string is in the target string
            bool contains = (target.Replace(" ", "").IndexOf(searchTerm.Replace(" ", "")) >= 0);

            // If the length <= 3, then it must be in the actual string (sans-spaces)
            if (searchTerm.Length <= 3 && !contains)
            {
                return 0;
            }

            // Give some weight if the searchStr is found at a word boundary
            double boundaryWeight = 1;

            // If the needed is found at the beginning of the string, then it gets a higher weight
            if (target.Replace(" ", "").IndexOf(searchTerm.Replace(" ", "")) == 0)
            {
                boundaryWeight = 1.2;
            }
            else
            {
                // Search through words
                foreach (var word in target.Split(' '))
                {
                    // And if the searchStr starts at the beginning of any word
                    if (word.IndexOf(searchTerm) == 0)
                    {
                        // It gets a weight, but a lesser one
                        boundaryWeight = 1.1;
                    }
                }
            }

            // If the string is actually contained, then minimum is .5
            double min = contains ? 0.5 : 0;

            // We can't have a greater chance than .99, as an exact match will give 1.
            return ((target.Length - dlDistance(target, searchTerm)) / (target.Length * boundaryWeight)).Clip(min, 0.99);
        }

        // https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
        // https://gist.github.com/wickedshimmy/449595/cb33c2d0369551d1aa5b6ff5e6a802e21ba4ad5c
        // http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
        /// <summary>
        /// Calculates the Damerau-Levenshtein distance
        /// </summary>
        /// <param name="original">The original string</param>
        /// <param name="modified">The modified string</param>
        /// <returns>The Damerau-Levenshtein distance</returns>
        private int dlDistance(string original, string modified)
        {
            int origLen = original.Length;
            int modiLen = modified.Length;
            original = original.ToLower();
            modified = modified.ToLower();

            var matrix = new int[origLen + 1, modiLen + 1];

            for (int i = 0; i <= origLen; ++i)
            {
                matrix[i, 0] = i;
            }
            for (int j = 0; j <= modiLen; ++j)
            {
                matrix[0, j] = j;
            }

            for (int i = 1; i <= origLen; ++i)
            {
                for (int j = 1; j <= modiLen; ++j)
                {
                    int cost = modified[j - 1] == original[i - 1] ? 0 : 1;
                    var values = new int[] {
                        matrix[i - 1, j] + 1,
                        matrix[i, j - 1] + 1,
                        matrix[i - 1, j - 1] + cost,
                    };

                    matrix[i, j] = values.Min();

                    if (i > 1 && j > 1 && original[i - 1] == modified[j - 2] && original[i - 2] == modified[j - 1])
                    {
                        matrix[i, j] = Math.Min(matrix[i, j], matrix[i - 2, j - 2] + cost);
                    }
                }
            }

            return matrix[origLen, modiLen];
        }
    }
}
