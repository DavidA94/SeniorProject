using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.WebHelpers;
using Shared.ApiResponses;
using Shared.SecurityTypes;
using System;
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
            /**/                        .Union(invoice.Vehicles.Select(v => v.VIN));

            if (duplicates.Any())
            {
                return new ApiResponse(false, $"The following VINs are already in another invoice:\n" + string.Join("\n", duplicates));
            }

            var employee = db.Employees.FirstOrDefault(e => e.UserID == validatedUser.UserID);

            if (employee == null) return new ApiResponse(false, "Access Denied");

            var dbb = db.Customers.Include(c => c.User)
                                  .Include(c => c.Emails).ThenInclude(email => email.Email);

            Debug.WriteLine(string.Join("\n", dbb.Select(c => c.User.Email)));

            var emaile = dbb.Where(c => c.User.Email.ToLower() == invoice.Buyer.User.Email.ToLowerInvariant());

            var fod = emaile.FirstOrDefault(c => c.EmployeeID == employee.UserID);

            // Check if the customer is already in the database
            var customer = invoice.Buyer.CustomerID >= 0 ? invoice.Buyer
                           : db.Customers.Include(c => c.User)
                                         .Include(c => c.Emails).ThenInclude(email => email.Email)
                                         .Where(c => c.User.Email.ToLower() == invoice.Buyer.User.Email.ToLowerInvariant() ||
                                                     c.Emails.Select(e => e.Email)
                                                             .Contains(invoice.Buyer.User.Email, StringComparer.OrdinalIgnoreCase))
                                         .FirstOrDefault(c => c.EmployeeID == employee.UserID);

            // Start building the right invoice

            var realInvoice = new Invoice()
            {
                Buyer = customer,
                DocFee = invoice.DocFee,
                DownPayment = invoice.DownPayment,
                Fees = invoice.Fees,
                InvoiceDate = invoice.InvoiceDate == DateTime.MinValue ? DateTime.Now : invoice.InvoiceDate,
                LienHolder = invoice.LienHolder,
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
                return new ApiResponse(false, string.Join("\n", ModelState.Values
                                                                          .Select(v => v.Errors.FirstOrDefault())
                                                                          .Select(e => e.ErrorMessage)));
            }

            db.Invoices.Add(realInvoice);

            if(db.SaveChanges() > 0)
            {
                return new ApiResponse(true, "Draft Sucessfully Saved");
            }

            return new ApiResponse(false, "Failed to save draft");
        }
    }
}
