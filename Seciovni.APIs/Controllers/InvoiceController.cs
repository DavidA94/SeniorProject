using Database.Tables;
using Database.Tables.ManyManyTables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.FormBuilderObjects;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
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
            Invoice dbInvoice = null;
            Employee employee = validateUser(Request, AccessPolicy.EditInvoicePrivilege);

            // Stop if they don't have access
            if (employee == null) return new ApiResponse(false, "Access Denied.");

            // Pull all the data we're going to need from the database, so there's not a ton of pegging it
            var dbInvoices = db.Invoices.Include(i => i.Buyer).ThenInclude(b => b.Address)
                                        .Include(i => i.Buyer).ThenInclude(b => b.Emails)
                                        .Include(i => i.Buyer).ThenInclude(b => b.User)
                                        .Include(i => i.Fees)
                                        .Include(i => i.LienHolder)
                                        .Include(i => i.Payments)
                                        .Include(i => i.SalesPerson).ThenInclude(sp => sp.User)
                                        .Include(i => i.Vehicles);

            var dbCustomers = db.Customers.Include(c => c.Address)
                                          .Include(c => c.Emails)
                                          .Include(c => c.User);

            // Ensure we have a valid sales person
            var salesPerson = db.Employees.FirstOrDefault(e => e.EmployeeID == invoice.SalesPerson.EmployeeID);
            if (salesPerson == null)
            {
                return new ApiResponse(false, "Invalid Sales Person");
            }

            // If this isn't a new invoice
            if (invoice.InvoiceID != 0)
            {
                // Ensure the source of the request matches
                int referrerID;
                if (!int.TryParse(Request.Headers.Referrer.Segments.Last(), out referrerID) || invoice.InvoiceID != referrerID)
                {
                    return new ApiResponse(false, "Invalid Request ID.");
                }

                // Find the invoice in the database
                dbInvoice = dbInvoices.FirstOrDefault(i => i.InvoiceID == invoice.InvoiceID);

                // If we can't find the invoice, there's a problem
                if (dbInvoice == null)
                {
                    return new ApiResponse(false, "Invalid Invoice ID");
                }
                // If the employee isn't and admin, and they don't own this invoice, don't let them modify it
                else if (employee.Job != JobType.Admin && dbInvoice.SalesPerson.EmployeeID != employee.EmployeeID)
                {
                    string firstName = dbInvoice.SalesPerson.User.FirstName;
                    string lastName = dbInvoice.SalesPerson.User.LastName;

                    return new ApiResponse(false, $"This invoice is owned by {firstName} {lastName}. " +
                                                   "You do not have permission to modify it.");
                }
            }

            // Ensure there is at least one vehicle.
            if (!invoice.Vehicles.Any())
            {
                return new ApiResponse(false, "At least one vehicle is required");
            }

            // Ensure the VINs that have been submitted are unique to the database
            var duplicates = dbInvoices.Where(i => i.InvoiceID != invoice.InvoiceID)
            /**/                       .SelectMany(i => i.Vehicles)
            /**/                       .Select(v => v.VIN)
            /**/                       .Intersect(invoice.Vehicles.Where(v => !string.IsNullOrWhiteSpace(v.VIN)).Select(v => v.VIN));

            if (duplicates.Any())
            {
                return new ApiResponse(false, $"The following VINs are already in another invoice:\n" + string.Join("\n", duplicates));
            }

            // Ensure there's no duplicate VINs
            if (invoice.Vehicles.Select(v => v.VIN).Distinct().Count() < invoice.Vehicles.Count)
            {
                return new ApiResponse(false, "One or more VINs are the same.");
            }

            // Ensure there's no duplicate Stock numbers
            if (invoice.Vehicles.Select(v => v.StockNum).Distinct().Count() < invoice.Vehicles.Count)
            {
                return new ApiResponse(false, "One or more Stock Numbers are the same.");
            }

            // Ensure all makes are known
            if (invoice.Vehicles.Any(v => v.Make == "Invalid"))
            {
                return new ApiResponse(false, $"The following VINs are unknown\n" +
                    string.Join("\n", invoice.Vehicles.Where(v => v.Make == "Invalid").Select(v => v.VIN)));
            }

            // Make the employee own this contact
            invoice.Buyer.EmployeeID = employee.EmployeeID;

            #region Check if the customer is already in the database

            Customer customer;
            bool usingDbCust = false;

            // If we were given a customer ID, then find it and make that the customer
            if (invoice.Buyer.CustomerID != 0)
            {
                var dbCust = dbCustomers.FirstOrDefault(c => c.CustomerID == invoice.Buyer.CustomerID);

                // Ensure we own the contact
                if (dbCust == null || dbCust.EmployeeID != employee.EmployeeID)
                {
                    return new ApiResponse(false, "Invalid Contact");
                }

                customer = dbCust;
                usingDbCust = true;
            }
            // Otherwise, we must have had one inputted
            else
            {
                // Find all users in the database with either the same email or phone number
                // And that is owned by this employee, or the devnull employee
                // Checking for the email or phone will help prevent duplicates, since
                // the user may input the customer by hand multiple times.
                var customers = dbCustomers
                    .Where(c => c.User.Email.ToLower() == invoice.Buyer.User.Email.ToLower() ||
                                c.Emails.Select(e => e.Email).Contains(invoice.Buyer.User.Email, StringComparer.OrdinalIgnoreCase) ||
                                c.PrimaryPhone == invoice.Buyer.PrimaryPhone)
                    .Where(c => c.EmployeeID == employee.UserID ||
                                c.EmployeeID == Constants.DEVNULL_EMPLOYEE_ID);

                // Grab the last one -- we'll assume that all others are somehow different
                var matchingCustomer = customers.LastOrDefault();

                // Assuming we actually found something
                if (matchingCustomer != null)
                {
                    // Then we need to make sure that this is its only invoice, or
                    // that there are no changes being made to it

                    var ownedInvoices = dbInvoices.Where(i => i.Buyer.CustomerID == matchingCustomer.CustomerID);
                    var numOwnedInvoices = ownedInvoices.Count();

                    // No matches (maybe deleted?) = no problem, it is the customer
                    // No changes = no problem, it can be reused
                    if (numOwnedInvoices == 0 || matchingCustomer.SoftEquals(invoice.Buyer))
                    {
                        customer = matchingCustomer;
                    }
                    // One match, and its this invoice
                    else if (numOwnedInvoices == 1 && ownedInvoices.First().InvoiceID == invoice.InvoiceID)
                    {
                        // Assing everything we got from the invoice to ensure it's up to date
                        customer = matchingCustomer;
                        customer.Address.City = invoice.Buyer.Address.City;
                        customer.Address.State = invoice.Buyer.Address.State;
                        customer.Address.StreetAddress = invoice.Buyer.Address.StreetAddress;
                        customer.Address.ZipCode = invoice.Buyer.Address.ZipCode;

                        customer.CompanyName = invoice.Buyer.CompanyName;
                        customer.DealerLicenseNumber = invoice.Buyer.DealerLicenseNumber;
                        customer.MCNumber = invoice.Buyer.MCNumber;
                        customer.ResaleNumber = invoice.Buyer.ResaleNumber;

                        customer.PrimaryPhone = invoice.Buyer.PrimaryPhone;

                        customer.User.Email = invoice.Buyer.User.Email;
                        customer.User.FirstName = invoice.Buyer.User.FirstName;
                        customer.User.LastName = invoice.Buyer.User.LastName;
                    }
                    // Otherwise, we will want a new customer, with devnull as the owner
                    else
                    {
                        customer = invoice.Buyer;
                        customer.EmployeeID = Constants.DEVNULL_EMPLOYEE_ID;
                    }
                }
                // Otherwise, the customer is not in the db yet
                else
                {
                    customer = invoice.Buyer;
                    customer.EmployeeID = Constants.DEVNULL_EMPLOYEE_ID;
                }
            }

            #endregion

            #region LienHolder -- TODO: Check if the lien holder is already in the database

            // TODO: Do this better

            // Null the lien-holder if it's empty
            var lienHolder = !(string.IsNullOrWhiteSpace(invoice.LienHolder.Address.StreetAddress) &&
                               string.IsNullOrWhiteSpace(invoice.LienHolder.Address.City) &&
                               string.IsNullOrWhiteSpace(invoice.LienHolder.Address.State) &&
                               string.IsNullOrWhiteSpace(invoice.LienHolder.Address.ZipCode) &&
                               string.IsNullOrWhiteSpace(invoice.LienHolder.EIN) &&
                               string.IsNullOrWhiteSpace(invoice.LienHolder.Name))
                            ? invoice.LienHolder
                            : null;

            #endregion

            // Clear the errors so we can re-validate again shortly
            ModelState.Clear();

            // If we're not editing an invoice, make the invoice to be submitted be the one we build up
            if (dbInvoice == null)
            {
                invoice = new Invoice()
                {
                    Buyer = customer,
                    DocFee = invoice.DocFee,
                    DownPayment = invoice.DownPayment,
                    Fees = invoice.Fees,
                    InvoiceDate = DateTime.Now,
                    ModifiedDate = DateTime.Now,
                    LienHolder = lienHolder,
                    Payments = invoice.Payments,
                    SalesPerson = salesPerson,
                    State = invoice.State,
                    TaxAmount = invoice.TaxAmount,
                    Vehicles = invoice.Vehicles
                };

                // Force validation on the model
                Validate(invoice);
            }
            // Otherwise, let's have some "fun" making sure things are removed and added correctly
            else
            {
                #region Fees

                // Delete old ones
                for (int i = dbInvoice.Fees.Count - 1; i >= 0; --i)
                {
                    var fee = dbInvoice.Fees[i];

                    if (!invoice.Fees.Contains(fee))
                    {
                        dbInvoice.Fees.Remove(fee);
                        db.Entry(fee).State = EntityState.Deleted;
                    }
                }

                // Add new ones
                foreach (var fee in invoice.Fees)
                {
                    if (!dbInvoice.Fees.Contains(fee)) dbInvoice.Fees.Add(fee);
                }

                #endregion

                #region Vehicles

                // Delete old ones
                for (int i = dbInvoice.Vehicles.Count - 1; i >= 0; --i)
                {
                    VehicleInfo vehicle = dbInvoice.Vehicles[i];

                    if (!invoice.Vehicles.Contains(vehicle))
                    {
                        dbInvoice.Vehicles.Remove(vehicle);
                        db.Entry(vehicle).State = EntityState.Deleted;
                    }
                }

                // Add new ones
                foreach (VehicleInfo vehicle in invoice.Vehicles)
                {
                    if (!dbInvoice.Vehicles.Contains(vehicle)) dbInvoice.Vehicles.Add(vehicle);
                }

                #endregion

                #region Payments

                // Delete old ones
                for (int i = dbInvoice.Payments.Count - 1; i >= 0; --i)
                {
                    Payment payment = dbInvoice.Payments[i];

                    if (!invoice.Payments.Contains(payment))
                    {
                        dbInvoice.Payments.Remove(payment);
                        db.Entry(payment).State = EntityState.Deleted;
                    }
                }

                // Add new ones
                foreach (Payment payment in invoice.Payments)
                {
                    if (!dbInvoice.Payments.Contains(payment)) dbInvoice.Payments.Add(payment);
                }

                #endregion

                dbInvoice.Buyer = customer;
                dbInvoice.DocFee = invoice.DocFee;
                dbInvoice.DownPayment = invoice.DownPayment;
                dbInvoice.LienHolder = lienHolder;
                dbInvoice.State = invoice.State;
                dbInvoice.TaxAmount = invoice.TaxAmount;
                dbInvoice.SalesPerson = salesPerson;

                dbInvoice.ModifiedDate = DateTime.Now;

                // Force validation on the model
                Validate(dbInvoice);
            }

            if (usingDbCust)
            {
                foreach (var error in ModelState)
                {
                    if (error.Key.StartsWith(nameof(Invoice.Buyer)) ||
                        error.Key.StartsWith(nameof(Invoice.SalesPerson)))
                    {
                        ModelState.Remove(error.Key);
                    }
                }
            }

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


            // If we have a new invoie, add it
            if (dbInvoice == null)
            {
                db.Invoices.Add(invoice);
            }

            try
            {
                if (db.SaveChanges() > 0)
                {
                    // If it's a new invoice, and somebody made it for another person, we need to send an email
                    if (true || dbInvoice == null && employee.EmployeeID != invoice.SalesPerson.EmployeeID)
                    {
                        var toUser = db.Employees.Include(e => e.User).FirstOrDefault(e => e.EmployeeID == salesPerson.EmployeeID).User;
                        var subject = $"Invoice {invoice.InvoiceID} was created for you!";
                        var message = string.Format(File.ReadAllText("EmailTemplates/NewInvoice.txt"),
                            invoice.Buyer.User.FullName(),
                            employee.User.FullName(),
                            $"/Invoies/View/{invoice.InvoiceID}");

#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                        Email.SendAsync(employee.User, toUser, subject, message);
#pragma warning restore CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed
                    }

                    return new ApiResponse(true, "Sucessfully Saved:" + invoice.InvoiceID.ToString());
                }

                return new ApiResponse(true, "Nothing to save");
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

            return new ApiResponse(false, "Failed to save invoice");
        }

        [HttpDelete(nameof(Delete) + "/{id}")]
        public ApiResponse Delete(int id)
        {
            Invoice dbInvoice = null;
            Employee employee = validateUser(Request, AccessPolicy.EditInvoicePrivilege);

            // Stop if they don't have access
            if (employee == null) return new ApiResponse(false, "Access Denied.");

            // Pull all the data we're going to need from the database, so there's not a ton of pegging it
            var dbInvoices = db.Invoices.Include(i => i.Buyer).ThenInclude(b => b.Address)
                                        .Include(i => i.Buyer).ThenInclude(b => b.Emails)
                                        .Include(i => i.Buyer).ThenInclude(b => b.User)
                                        .Include(i => i.Fees)
                                        .Include(i => i.IIPT)
                                        .Include(i => i.LienHolder)
                                        .Include(i => i.Payments)
                                        .Include(i => i.SalesPerson).ThenInclude(sp => sp.User)
                                        .Include(i => i.Vehicles);

            // Find the invoice in the database
            dbInvoice = dbInvoices.FirstOrDefault(i => i.InvoiceID == id);

            // If we can't find the invoice, there's a problem
            if (dbInvoice == null)
            {
                return new ApiResponse(false, "Invalid Invoice ID");
            }
            // If the employee isn't and admin, and they don't own this invoice, don't let them delete it
            else if (employee.Job != JobType.Admin && dbInvoice.SalesPerson.EmployeeID != employee.EmployeeID)
            {
                string firstName = dbInvoice.SalesPerson.User.FirstName;
                string lastName = dbInvoice.SalesPerson.User.LastName;

                return new ApiResponse(false, $"This invoice is owned by {firstName} {lastName}. " +
                                                "You do not have permission to modify it.");
            }

            // Check if the customer should be deleted from the database
            bool shouldDelCust = dbInvoice.Buyer.EmployeeID == Constants.DEVNULL_EMPLOYEE_ID &&
                                 dbInvoices.Count(i => i.Buyer.CustomerID == dbInvoice.Buyer.CustomerID) < 2;

            // Delete everything that should be
            db.Entry(dbInvoice).State = EntityState.Deleted;
            foreach (var fee in dbInvoice.Fees) db.Entry(fee).State = EntityState.Deleted;
            foreach (var iipt in dbInvoice.IIPT) db.Entry(iipt).State = EntityState.Deleted;
            if (dbInvoice.LienHolder != null)
            {
                db.Entry(dbInvoice.LienHolder).State = EntityState.Deleted;
                db.Entry(dbInvoice.LienHolder.Address).State = EntityState.Deleted;
            }
            foreach (var payment in dbInvoice.Payments) db.Entry(payment).State = EntityState.Deleted;
            foreach (var vehicle in dbInvoice.Vehicles) db.Entry(vehicle).State = EntityState.Deleted;

            if (shouldDelCust)
            {
                db.Entry(dbInvoice.Buyer).State = EntityState.Deleted;
                db.Entry(dbInvoice.Buyer.Address).State = EntityState.Deleted;
            }

            try
            {
                if (db.SaveChanges() > 0)
                {
                    return new ApiResponse(true, "Sucessfully deleted invoice " + dbInvoice.InvoiceID.ToString());
                }
                else
                {
                    return new ApiResponse(true, "Failed to delete invoice " + dbInvoice.InvoiceID.ToString());
                }
            }
            catch (Exception ex)
            {
                string message = "An error occurred while deleting the invoice: " + ex.Message;
                if (ex.InnerException != null)
                {
                    message += "\n\n" + ex.InnerException.Message;
                }

                return new ApiResponse(false, message);
            }
        }

        [HttpGet(nameof(Get) + "/{id}")]
        public Invoice Get(int id)
        {
            var invoices = db.Invoices.Include(i => i.Buyer).ThenInclude(b => b.Address)
                                      .Include(i => i.Buyer).ThenInclude(b => b.User)
                                      .Include(i => i.Fees)
                                      .Include(i => i.LienHolder).ThenInclude(l => l.Address)
                                      .Include(i => i.Payments)
                                      .Include(i => i.SalesPerson).ThenInclude(s => s.User)
                                      .Include(i => i.Vehicles);

            var invoice = invoices.FirstOrDefault(i => i.InvoiceID == id);

            // Don't make the front end think it's a contact if it belongs to dev-null
            if (invoice != null && invoice.Buyer.EmployeeID == Constants.DEVNULL_EMPLOYEE_ID)
            {
                invoice.Buyer.CustomerID = 0;
            }

            return invoice;
        }

        [HttpGet(nameof(GetRecent))]
        public IEnumerable<InvoicePreview> GetRecent()
        {
            const int NUM_TO_GET = 20;

            var employee = validateUser(Request, AccessPolicy.ViewInvoicePrivilege);
            if (employee == null) yield break;

            var dbInvoices = db.Invoices.Include(i => i.Buyer).ThenInclude(b => b.User)
                                        .Include(i => i.Fees)
                                        .Include(i => i.Payments)
                                        .Include(i => i.SalesPerson).ThenInclude(sp => sp.User)
                                        .Include(i => i.Vehicles);

            IEnumerable<Invoice> invoicesToUse;

            if (employee.Job != JobType.Admin && employee.Job != JobType.Assistant)
            {
                invoicesToUse = dbInvoices.Where(i => i.SalesPerson.EmployeeID == employee.EmployeeID)
                                          .OrderByDescending(i => i.ModifiedDate)
                                          .Take(NUM_TO_GET);
            }
            else
            {
                invoicesToUse = dbInvoices.OrderByDescending(i => i.ModifiedDate).Take(NUM_TO_GET);
            }

            foreach (var invoice in invoicesToUse)
            {
                yield return new InvoicePreview()
                {
                    BuyerName = invoice.Buyer.User.FullName(),
                    CreatedDate = invoice.InvoiceDate,
                    InvoiceNumber = invoice.InvoiceID,
                    InvoiceTotal = invoice.GetTotal(),
                    ModifiedDate = invoice.ModifiedDate,
                    TotalDue = invoice.GetDue(),
                    SalesPerson = invoice.SalesPerson.User.FullName()
                };
            }
        }

        [HttpGet(nameof(GetSalesPeople))]
        public JsonResult GetSalesPeople()
        {
            User current;
            if (Request.HasValidLogin(db, out current) && Request.CanAccess(db, AccessPolicy.EditInvoicePrivilege))
            {
                var employees = db.Employees.Include(e => e.User)
                                            .Where(e => e.EmployeeID > Constants.DEVNULL_EMPLOYEE_ID &&
                                                        (e.Job == JobType.Sales || e.Job == JobType.Admin))
                                            .Select(e => new
                                            {
                                                id = e.EmployeeID,
                                                name = (e.User.FullName() == current.FullName()
                                                            ? "**" + e.User.FullName()
                                                            : e.User.FullName())
                                            });

                return new JsonResult(employees);
            }

            return null;
        }

        [HttpGet(nameof(GetPrintOptions) + "/{id}")]
        public IEnumerable<string> GetPrintOptions(int id)
        {
            var retVal = new HashSet<string>();

            if(!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.ViewInvoicePrivilege))
            {
                return null;
            }

            var invoice = db.Invoices.Include(i => i.IIPT).FirstOrDefault(i => i.InvoiceID == id);
            if (invoice == null) return null;

            var forms = db.InvoiceTemplates.Where(t => t.States.HasFlag(invoice.State));

            foreach(var form in forms)
            {
                if(invoice.IIPT.FirstOrDefault(i => i.TemplateID == form.TemplateID) != null)
                {
                    // Just remove it since it has to have the * added, the, add the new one
                    retVal.Remove(form.TemplateTitle);
                    retVal.Add("*" + form.TemplateTitle);
                }
                else
                {
                    // Only add it if it hasn't been already
                    if (!retVal.Contains(form.TemplateTitle) && !retVal.Contains("*" + form.TemplateTitle))
                    {
                        retVal.Add(form.TemplateTitle);
                    }
                }
            }

            return retVal;
        }

        [HttpPost(nameof(Print) + "/{id}")]
        public ApiResponse Print([FromBody]List<string> pages, int id)
        {
            if (!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.ViewInvoicePrivilege))
            {
                return new ApiResponse(false, "Permission Denied");
            }
            

            var invoice = db.Invoices.Include(i => i.IIPT).ThenInclude(ii => ii.InvoicePageTempate)
                                     .Include(i => i.Buyer).ThenInclude(b => b.Address)
                                     .Include(i => i.Buyer).ThenInclude(b => b.User)
                                     .Include(i => i.Fees)
                                     .Include(i => i.LienHolder).ThenInclude(l => l.Address)
                                     .Include(i => i.Payments)
                                     .Include(i => i.SalesPerson).ThenInclude(sp => sp.User)
                                     .Include(i => i.Vehicles)
                                     .FirstOrDefault(i => i.InvoiceID == id);
            if (invoice == null) return new ApiResponse(false, "Invalid Invoice");

            // If there's nothing to print, that's a special "Clear current forms" command
            if (pages.Count == 0)
            {
                invoice.IIPT.Clear();
                db.SaveChanges();
                return new ApiResponse(true, "Legacy Forms have been cleared");
            }

            // Ensure everything is locked in
            foreach(var page in pages)
            {
                if (invoice.IIPT.FirstOrDefault(ii => ii.InvoicePageTempate.TemplateTitle == page) == null)
                {
                    var template = db.InvoiceTemplates.LastOrDefault(t => t.TemplateTitle == page);
                    if(template == null)
                    {
                        return new ApiResponse(false, $"{page} is not a valid page to print");
                    }

                    invoice.IIPT.Add(new InvoiceInvoicePageTemplate()
                    {
                        Invoice = invoice,
                        InvoiceID = invoice.InvoiceID,
                        InvoicePageTempate = template,
                        TemplateID = template.TemplateID
                    });
                }
            }

            // Make sure everything is aved
            db.SaveChanges();

            // Convert all the forms to be printed
            var settings = new JsonSerializerSettings() { TypeNameHandling = TypeNameHandling.Auto };
            List<FormBuilder> forms = new List<FormBuilder>();
            foreach(var iipt in invoice.IIPT)
            {
                if (pages.Contains(iipt.InvoicePageTempate.TemplateTitle))
                {
                    forms.Add(JsonConvert.DeserializeObject<FormBuilder>(iipt.InvoicePageTempate.TemplateJSON, settings));
                }
            }

            var path = PdfBuilder.PdfBuilder.Generate(forms, invoice);

            byte[] file;
            using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read))
            {
                using (var reader = new BinaryReader(stream))
                {
                    file = reader.ReadBytes((int)stream.Length);
                }
            }

            string b64 = Convert.ToBase64String(File.ReadAllBytes(path));

            return new ApiResponse(true, b64);
        }

        /// <summary>
        /// Checks if the current user has permission to access this section
        /// </summary>
        /// <param name="request">The request gotten from the user</param>
        /// <returns>The employee, or null if the user is not validated</returns>
        private Employee validateUser(HttpRequestMessage request, string requiredPriviledge)
        {
            User validatedUser;

            // Ensure the request is valid
            if (!request.HasValidLogin(db, out validatedUser) || !request.CanAccess(db, requiredPriviledge))
            {
                return null;
            }

            // Ensure the current employee is valid
            var employee = db.Employees.FirstOrDefault(e => e.UserID == validatedUser.UserID);

            return employee;
        }
    }
}
