using Database.Tables;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.FormBuilderObjects;
using Shared.FormBuilderObjects.FBObjects;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace Seciovni.APIs.Controllers
{
    [Route("api/[controller]")]
    public class FormBuilderController : ApiController
    {
        private SeciovniContext db;

        public FormBuilderController(SeciovniContext context)
        {
            db = context;
        }

        [HttpPost(nameof(Save))]
        public ApiResponse Save()
        {
            if (!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.FormEditorPrivilege))
            {
                return new ApiResponse(false, "Permission Denied");
            }



            InvoicePageTemplate template = null;
            bool overwrite = false;

            // Parse the JSON so we can get the Title, and check for binding errors
            var requestJSON = Request.Content.ReadAsStringAsync().Result;
            FormBuilder fb = JsonConvert.DeserializeObject<FormBuilder>(requestJSON,
                new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.Auto });

            // Ensure there are no binding errors
            if (hasBindingError(fb)) return new ApiResponse(false, "One or more binding errors have been found");

            // Get the "page" that submitted this -- [null = new template]
            var pageName = WebUtility.UrlDecode(Request.Headers.Referrer.Segments.Last());
            if (pageName.Trim().ToLower() == "edit") pageName = null;

            // Try to get the template from the database

            if (pageName != null)
            {
                template = db.InvoiceTemplates
                             .Include(t => t.IIPT)
                             .LastOrDefault(t => t.TemplateTitle.ToLower() == pageName.ToLower());
            }

            // New Template
            if (pageName == null)
            {
                // Duplicate Name
                if (template != null)
                {
                    // No header = Prompt User
                    if (!Request.Headers.Contains(Constants.OVERWRITE_HEADER))
                    {
                        return new ApiResponse(false, "Overwrite?");
                    }
                    // Has header to overwrite
                    else
                    {
                        overwrite = true;
                    }
                }
            }
            // Edit Template
            else
            {
                // No template = ERROR
                if (template == null) return new ApiResponse(false, "Bad Request");
                else
                {
                    overwrite = true;
                }
            }

            // If we're set to overwerite, but there are things already using the template, then don't overwrite
            if (overwrite && template.IIPT.Count > 0)
            {
                overwrite = false;
            }

            // Create new
            if (!overwrite)
            {
                db.InvoiceTemplates.Add(new InvoicePageTemplate
                {
                    TemplateTitle = fb.Title,
                    TemplateJSON = requestJSON
                });
            }
            // Edit what's already there
            else
            {
                template.TemplateTitle = fb.Title;
                template.TemplateJSON = requestJSON;
            }

            // To to save the changes
            try
            {
                if (db.SaveChanges() > 0)
                {
                    return new ApiResponse(true, "Successfully Saved");
                }

            }
            catch (Exception ex)
            {
                string message = "An error occurred while saving the invoice: " + ex.Message;
                if (ex.InnerException != null)
                {
                    message += "\n\n" + ex.InnerException.Message;
                }

                return new ApiResponse(false, message);
            }

            return new ApiResponse(false, "Failed to save the template");
        }

        [HttpGet(nameof(Get) + "/{pageName}")]
        public string Get(string pageName)
        {
            // If we don't have a valid request, then no-go
            if (!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.FormEditorPrivilege)) return null;

            return db.InvoiceTemplates.LastOrDefault(t => t.TemplateTitle.ToLower() == pageName.ToLower())?.TemplateJSON;
        }

        [HttpGet(nameof(BindingOptions) + "/{option}")]
        public IEnumerable<BindingOptionData> BindingOptions(BindingOption option)
        {
            List<BindingOptionData> retVal = new List<BindingOptionData>();

            if (option == BindingOption.BOTH || option == BindingOption.REPEATING)
            {
                const string MISC_CHARGE = "Miscellaneous Charge";
                const string MISC_FEE = nameof(MiscellaneousFee);

                const string PAYMENT = nameof(Payment);

                const string VEHICLE = "Vehicle";
                const string VEHICLE_INFO = nameof(VehicleInfo);

                retVal.InsertRange(0, new List<BindingOptionData>
                {
                    new BindingOptionData(MISC_CHARGE, nameof(MiscellaneousFee.Description), MISC_FEE + "." + nameof(MiscellaneousFee.Description)),
                    new BindingOptionData(MISC_CHARGE, nameof(MiscellaneousFee.Price), MISC_FEE + "." + nameof(MiscellaneousFee.Price)),

                    new BindingOptionData(PAYMENT, nameof(Payment.Date), PAYMENT + "." + nameof(Payment.Date)),
                    new BindingOptionData(PAYMENT, nameof(Payment.Description), PAYMENT + "." + nameof(Payment.Description)),
                    new BindingOptionData(PAYMENT, nameof(Payment.Amount), PAYMENT + "." + nameof(Payment.Amount)),

                    new BindingOptionData(VEHICLE, "Stock Number", VEHICLE_INFO + "." + nameof(VehicleInfo.StockNum)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.VIN), VEHICLE_INFO + "." + nameof(VehicleInfo.VIN)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Year), VEHICLE_INFO + "." + nameof(VehicleInfo.Year)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Make), VEHICLE_INFO + "." + nameof(VehicleInfo.Make)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Model), VEHICLE_INFO + "." + nameof(VehicleInfo.Model)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Miles), VEHICLE_INFO + "." + nameof(VehicleInfo.Miles)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Location), VEHICLE_INFO + "." + nameof(VehicleInfo.Location)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Price), VEHICLE_INFO + "." + nameof(VehicleInfo.Price)),
                });
            }
            if (option == BindingOption.BOTH || option == BindingOption.SINGLE)
            {
                const string INVOICE = nameof(Invoice);
                const string BUYER = nameof(Invoice.Buyer);
                const string LIEN_HOLDER = nameof(Invoice.LienHolder);
                const string USER = nameof(Customer.User);
                const string ADDRESS = nameof(Customer.Address);

                retVal.InsertRange(0, new List<BindingOptionData>
                {
                    new BindingOptionData(INVOICE, "Invoice Number", nameof(Invoice.InvoiceID)),
                    new BindingOptionData(INVOICE, "Invoice Date", nameof(Invoice.InvoiceDate)),
                    new BindingOptionData(INVOICE, "Invoice State", nameof(Invoice.State)),
                    new BindingOptionData(INVOICE, "Sales Person", nameof(Invoice.SalesPerson)),
                    new BindingOptionData(INVOICE, "Tax", nameof(Invoice.TaxAmount)),
                    new BindingOptionData(INVOICE, "Doc Fee", nameof(Invoice.DocFee)),
                    new BindingOptionData(INVOICE, "Down Payment", nameof(Invoice.DownPayment)),
                    new BindingOptionData(INVOICE, "Invoice Total", "Total"),
                    new BindingOptionData(INVOICE, "Amount Due", "Due"),


                    new BindingOptionData(BUYER, "First Name", $"{BUYER}.{USER}.{nameof(Database.Tables.User.FirstName)}"),
                    new BindingOptionData(BUYER, "Last Name", $"{BUYER}.{USER}.{nameof(Database.Tables.User.LastName)}"),
                    new BindingOptionData(BUYER, "Company", $"{BUYER}.{nameof(Customer.CompanyName)}"),
                    new BindingOptionData(BUYER, "E-Mail", $"{BUYER}.{USER}.{nameof(Database.Tables.User.Email)}"),
                    new BindingOptionData(BUYER, "Phone Number", $"{BUYER}.{nameof(Customer.PhoneNumbers)}[0]"),
                    new BindingOptionData(BUYER, "Street Address", $"{BUYER}.{ADDRESS}.{nameof(Address.StreetAddress)}"),
                    new BindingOptionData(BUYER, "City", $"{BUYER}.{ADDRESS}.{nameof(Address.City)}"),
                    new BindingOptionData(BUYER, "State", $"{BUYER}.{ADDRESS}.{nameof(Address.State)}"),
                    new BindingOptionData(BUYER, "ZIP", $"{BUYER}.{ADDRESS}.{nameof(Address.ZipCode)}"),
                    new BindingOptionData(BUYER, "Dealer License Number", $"{BUYER}.{nameof(Customer.DealerLicenseNumber)}"),
                    new BindingOptionData(BUYER, "MC Number", $"{BUYER}.{nameof(Customer.MCNumber)}"),
                    new BindingOptionData(BUYER, "Resale Number", $"{BUYER}.{nameof(Customer.ResaleNumber)}"),

                    new BindingOptionData("Lien Holder", "Name", $"{LIEN_HOLDER}.{nameof(LienHolder.Name)}"),
                    new BindingOptionData("Lien Holder", "Street Address", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.StreetAddress)}"),
                    new BindingOptionData("Lien Holder", "City", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.City)}"),
                    new BindingOptionData("Lien Holder", "State", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.State)}"),
                    new BindingOptionData("Lien Holder", "ZIP", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.ZipCode)}"),
                    new BindingOptionData("Lien Holder", "EIN", $"{LIEN_HOLDER}.{nameof(LienHolder.EIN)}"),
                });
            }

            return retVal;
        }

        private bool hasBindingError(FormBuilder fb)
        {
            // Check if there are any binding errors
            bool hasBindingError = false;

            foreach (var shape in fb.Canvas.Shapes)
            {
                if (shape is Table)
                {
                    foreach (var col in (shape as Table).Cells)
                    {
                        hasBindingError |= col["header"].HasBindingError;
                        hasBindingError |= col["content"].HasBindingError;
                    }
                }
                if (shape is FBTextBlock)
                {
                    hasBindingError |= (shape as FBTextBlock).TextBlock.HasBindingError;
                }
            }

            return hasBindingError;
        }
    }
}
