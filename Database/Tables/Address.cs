using Database.Tables;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;
using Shared;
using System.Net.Http;
using System.Xml.Linq;
using System.Linq;
using Newtonsoft.Json;

namespace Database.Tables
{
    public class Address : IValidatableObject
    {
        public Address()
        {
            // Until we support other countries
            Country = Country.USA;
        }

        [Key]
        [JsonIgnore]
        public int AddressID { get; set; }

        [ForeignKey(nameof(Customer))]
        public int CustomerID { get; set; }

        [Display(Name = "Street Address")]
        [Required]
        public string StreetAddress { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        [StringLength(2, MinimumLength = 2)]
        public string State { get; set; }

        [Display(Name = "ZIP Code")]
        [Required]
        public string ZipCode { get; set; }

        /// <summary>
        /// Needed for Mexico
        /// </summary>
        public string Locality { get; set; }

        [Required]
        public Country Country { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            int outZip;

            // USA and Mexico zips but be 5 digits long
            if(Country != Country.Canada && (!int.TryParse(ZipCode, out outZip) || ZipCode.Length != 5))
            {
                yield return new ValidationResult("Zip code must be a 5 digit number");
            }
            else if(Country == Country.Canada && ZipCode.Length != 6)
            {
                yield return new ValidationResult("Zip code must be 6 characters");
            }
            

            // Validate the address if it's USA
            if(Country == Country.USA && !validUsaAdress())
            {
                yield return new ValidationResult("The given address is not valid");
            }
        }

        private bool validUsaAdress()
        {
            using (var client = new HttpClient())
            {
                XElement root = new XElement("AddressValidateRequest", new XAttribute("USERID", "419NA0000090"));
                root.Add(new XElement("IncludeOptionalElements", false));
                root.Add(new XElement("ReturnCarrierRoute", false));

                var address = new XElement("Address", new XAttribute("ID", 0));
                address.Add(new XElement("Address1"));
                address.Add(new XElement("Address2", StreetAddress));
                address.Add(new XElement("City", City));
                address.Add(new XElement("State", State));
                address.Add(new XElement("Zip5", ZipCode));
                address.Add(new XElement("Zip4"));

                root.Add(address);

                // Prod URL = http://production.shippingapis.com/ShippingAPI.dll
                string webAddress = "https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML=" + root.ToString(SaveOptions.DisableFormatting);

                using (var request = new HttpRequestMessage(HttpMethod.Get, webAddress))
                {
                    var response = client.SendAsync(request).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        var result = response.Content.ReadAsStringAsync().Result;
                        var xmlResponse = XElement.Parse(result);

                        // <Error> in the XML indicates an invalid address
                        return !xmlResponse.Descendants().Any(n => n.Name.LocalName.ToLower() == "error");
                    }
                    else return false;
                }
            }
        }
    }
}
