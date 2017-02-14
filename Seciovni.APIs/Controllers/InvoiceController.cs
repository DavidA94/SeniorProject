using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
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
            Invoice dbInvoice = null;

            // Ensure the request is valid
            if (!Request.HasValidLogin(db, out validatedUser) || !Request.CanAccess(db, AccessPolicy.EditInvoicePrivilege))
            {
                return new ApiResponse(false, "Access Denied.");
            }

            // Ensure the current employee is valid
            var employee = db.Employees.FirstOrDefault(e => e.UserID == validatedUser.UserID);
            if (employee == null) return new ApiResponse(false, "Access Denied");

            // Pull all the data we're going to need from the database, so there's not a ton of pegging it
            var dbInvoices = db.Invoices.Include(i => i.Buyer).ThenInclude(b => b.Address)
                                        .Include(i => i.Buyer).ThenInclude(b => b.Emails)
                                        .Include(i => i.Buyer).ThenInclude(b => b.PhoneNumbers)
                                        .Include(i => i.Buyer).ThenInclude(b => b.User)
                                        .Include(i => i.Fees)
                                        .Include(i => i.LienHolder)
                                        .Include(i => i.Payments)
                                        .Include(i => i.SalesPerson).ThenInclude(sp => sp.Contacts)
                                        .Include(i => i.SalesPerson).ThenInclude(sp => sp.User)
                                        .Include(i => i.Vehicles);

            var dbCustomers = db.Customers.Include(c => c.Address)
                                          .Include(c => c.Emails)
                                          .Include(c => c.PhoneNumbers)
                                          .Include(c => c.User);

            // Clean up the phone numbers we got, to just be the digits
            invoice.Buyer.PhoneNumbers.ForEach(p => new string(p.Number.Where(char.IsDigit).ToArray()));

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
                                c.PhoneNumbers.FirstOrDefault() == invoice.Buyer.PhoneNumbers.FirstOrDefault())
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
                    if(numOwnedInvoices == 0 || matchingCustomer.SoftEquals(invoice.Buyer))
                    {
                        customer = matchingCustomer;
                    }
                    // One match, and its this invoice
                    else if(numOwnedInvoices == 1 && ownedInvoices.First().InvoiceID == invoice.InvoiceID){
                        // Assing everything we got from the invoice to ensure it's up to date
                        customer = matchingCustomer;
                        customer.Address.City = invoice.Buyer.Address.City;
                        customer.Address.State = invoice.Buyer.Address.State;
                        customer.Address.StreetAddress = invoice.Buyer.Address.StreetAddress;
                        customer.Address.ZipCode = invoice.Buyer.Address.ZipCode;

                        customer.CompanyName = invoice.Buyer.CompanyName;
                        customer.DealerLicenseNumber = invoice.Buyer.DealerLicenseNumber;
                        customer.MCNumber = invoice.Buyer.MCNumber;
                        customer.PhoneNumbers = invoice.Buyer.PhoneNumbers;
                        customer.ResaleNumber = invoice.Buyer.ResaleNumber;

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

            // Track if we need to add, or just ave
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
                    InvoiceDate = invoice.InvoiceDate == DateTime.MinValue ? DateTime.Now : invoice.InvoiceDate,
                    LienHolder = lienHolder,
                    PagesUsed = invoice.PagesUsed,
                    Payments = invoice.Payments,
                    SalesPerson = invoice.SalesPerson ?? employee,
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
                for(int i = dbInvoice.Fees.Count - 1; i >= 0; --i)
                {
                    var fee = dbInvoice.Fees[i];

                    if (!invoice.Fees.Contains(fee))
                    {
                        dbInvoice.Fees.Remove(fee);
                    }
                }

                // Add new ones
                foreach(var fee in invoice.Fees)
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

                // Force validation on the model
                Validate(dbInvoice);
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
                    return new ApiResponse(true, "Sucessfully Saved:" + invoice.InvoiceID.ToString());
                }
            }
            catch (Exception ex)
            {
                string message = "An error occurred while saving the invoice: " + ex.Message;
                if(ex.InnerException != null)
                {
                    message += "\n\n" + ex.InnerException.Message;
                }

                return new ApiResponse(false, message);
            }

            return new ApiResponse(false, "Failed to save draft");
        }

        [HttpGet(nameof(Get))]
        public Invoice Get(int id)
        {
            var invoices = db.Invoices.Include(i => i.Buyer).ThenInclude(b => b.Address)
                                      .Include(i => i.Buyer).ThenInclude(b => b.User)
                                      .Include(i => i.Fees)
                                      .Include(i => i.LienHolder).ThenInclude(l => l.Address)
                                      .Include(i => i.PagesUsed)
                                      .Include(i => i.Payments)
                                      .Include(i => i.SalesPerson).ThenInclude(s => s.User)
                                      .Include(i => i.Vehicles);

            return invoices.FirstOrDefault(i => i.InvoiceID == 1);
        }
    }
}
