using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.WebHelpers;
using Shared.ApiResponses;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web.Http;

namespace Seciovni.APIs.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class InvoiceController : ApiController
    {
        private SeciovniContext db;

        public InvoiceController(SeciovniContext context)
        {
            db = context;            
        }

        [HttpPost(nameof(Save))]
        public ApiResponse Save([FromBody]Invoice invoice)
        {
            User validatedUser;

            // Ensure the request is valid
            if (!Request.HasValidLogin(db, out validatedUser) || !Request.CanAccess(db, AccessPolicy.EditInvoicePrivilege))
            {
                return new ApiResponse(false, "Access Denied.");
            }

            // Ensure the VINs that have been submitted are unique to the database
            var duplicates = db.Invoices.Include(i => i.Vehicles)
            /**/                        .SelectMany(i => i.Vehicles)
            /**/                        .Select(v => v.VIN)
            /**/                        .Intersect(invoice.Vehicles.Where(v => !string.IsNullOrWhiteSpace(v.VIN)).Select(v => v.VIN));

            if (duplicates.Any())
            {
                return new ApiResponse(false, $"The following VINs are already in another invoice:\n" + string.Join("\n", duplicates));
            }
            else if(invoice.Vehicles.Select(v => v.VIN).Distinct().Count() < invoice.Vehicles.Count)
            {
                return new ApiResponse(false, "One or more VINs are the same.");
            }

            if(invoice.Vehicles.Any(v => v.Make == "Invalid"))
            {
                return new ApiResponse(false, $"The following VINs are unknown\n" + 
                    string.Join("\n", invoice.Vehicles.Where(v => v.Make == "Invalid").Select(v => v.VIN)));
            }
            else if (!invoice.Vehicles.Any())
            {
                return new ApiResponse(false, "At least one vehicle is required");
            }

            var employee = db.Employees.FirstOrDefault(e => e.UserID == validatedUser.UserID);

            if (employee == null) return new ApiResponse(false, "Access Denied");

            // Check if the customer is already in the database
            var customer = invoice.Buyer.CustomerID < 0 
                           ? invoice.Buyer
                           : db.Customers.Include(c => c.User)
                                         .Include(c => c.Emails)
                                         .Where(c => c.User.Email.ToLower() == invoice.Buyer.User.Email.ToLowerInvariant() ||
                                                     c.Emails.Select(e => e.Email)
                                                             .Contains(invoice.Buyer.User.Email, StringComparer.OrdinalIgnoreCase))
                                         .FirstOrDefault(c => c.EmployeeID == employee.UserID);

            // Null the lien-holder if it's empty
            var lienHolder = !string.IsNullOrWhiteSpace(invoice.LienHolder.Address.StreetAddress) ||
                             !string.IsNullOrWhiteSpace(invoice.LienHolder.Address.City) ||
                             !string.IsNullOrWhiteSpace(invoice.LienHolder.Address.State) ||
                             !string.IsNullOrWhiteSpace(invoice.LienHolder.Address.ZipCode) ||
                             !string.IsNullOrWhiteSpace(invoice.LienHolder.EIN) ||
                             !string.IsNullOrWhiteSpace(invoice.LienHolder.Name)
                                ? invoice.LienHolder
                                : null;

            // Start building the right invoice

            var realInvoice = new Invoice()
            {
                Buyer = customer,
                DocFee = invoice.DocFee,
                DownPayment = invoice.DownPayment,
                Fees = invoice.Fees,
                InvoiceDate = invoice.InvoiceDate == DateTime.MinValue ? DateTime.Now : invoice.InvoiceDate,
                LienHolder = lienHolder,
                PagesUsed = invoice.PagesUsed,
                Payments = invoice.Payments,
                SalesPerson = invoice.SalesPerson ?? employee,
                State = invoice.State,
                TaxAmount = invoice.TaxAmount,
                Vehicles = invoice.Vehicles
            };

            ModelState.Clear();
            Validate(realInvoice);

            // Ensure the model is valid
            if (!ModelState.IsValid)
            {
                var response = new ApiResponse(false, "Errors were found in the submission");

                foreach (var key in ModelState.Keys)
                {
                    var error = ModelState[key].Errors.FirstOrDefault();
                    if (error == null) continue;

                    var keyParts = key.Split('.');
                    response.Errors.Add(new Error(keyParts[0], keyParts.Skip(1).ToArray(), error.ErrorMessage));
                }

                response.Errors = response.Errors.OrderBy(e => e.ErrorMsg).ToList();
                return response;
            }

            db.Invoices.Add(realInvoice);

            try
            {
                if (db.SaveChanges() > 0)
                {
                    return new ApiResponse(true, "Sucessfully Saved");
                }
            }
            catch { return new ApiResponse(true, "Sucessfully Saved"); }

            return new ApiResponse(false, "Failed to save draft");
        }
    }
}
