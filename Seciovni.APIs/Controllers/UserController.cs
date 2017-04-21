using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.Contracts;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Seciovni.APIs.Controllers
{

    [Authorize]
    [Route("api/[controller]")]
    public class UserController : ApiController
    {
        private SeciovniContext db;

        public UserController(SeciovniContext context)
        {
            db = context;
        }

        [HttpGet(nameof(Contacts))]
        public IEnumerable<FullContact> Contacts()
        {
            var employee = validateUser(Request, AccessPolicy.EditInvoicePrivilege);
            if (employee == null) yield break;

            var dbInvoices = db.Invoices.Include(i => i.Buyer);

            var contacts = db.Customers.Include(c => c.Address)
                                       .Include(c => c.User)
                                       .Where(c => c.EmployeeID == employee.EmployeeID).ToList();


            foreach (var contact in contacts)
            {
                var currentCustId = contact.CustomerID;
                List<Invoice> invoices = new List<Invoice>();

                while(currentCustId > 0)
                {
                    invoices.AddRange(dbInvoices.Where(i => i.Buyer.CustomerID == currentCustId));
                    currentCustId = db.Customers.FirstOrDefault(c => c.CustomerID == currentCustId)?.PreviousCustomerID ?? 0;
                }

                yield return new FullContact()
                {
                    Contact = contact,
                    Invoices = invoices.Select(i => new InvoicePreview() { CreatedDate = i.InvoiceDate, InvoiceNumber = i.InvoiceID }).ToList()
                };
            }
        }

        [HttpGet(nameof(ContactsPreview))]
        public IEnumerable<Customer> ContactsPreview()
        {
            var fullContacts = Contacts();
            var previewContacts = new List<Customer>();

            foreach (var fullContact in fullContacts)
            {
                previewContacts.Add(new Customer()
                {
                    CustomerID = fullContact.Contact.CustomerID,
                    Address = fullContact.Contact.Address,
                    User = new User()
                    {
                        FirstName = fullContact.Contact.User.FirstName,
                        LastName = fullContact.Contact.User.LastName,
                        Email = fullContact.Contact.User.Email,
                    }
                });
            }

            return previewContacts;
        }

        [HttpPost(nameof(SaveContact) + "/{contactID}")]
        public ApiResponse SaveContact([FromBody]Customer contact, int contactID)
        {
            var employee = validateUser(Request, AccessPolicy.EditInvoicePrivilege);
            if(employee == null)
            {
                return new ApiResponse(false, "Access Denied");
            }

            var dbContact = db.Customers.Include(c => c.User)
                                        .Include(c => c.Address)
                                        .FirstOrDefault(c => c.EmployeeID == employee.EmployeeID &&
                                                             c.CustomerID == contactID);

            // Ensure the employee owns the contact
            if (contactID > 0 && dbContact == null)
            {
                return new ApiResponse(false, "Access Denied. You do not own this contact");
            }

            // Clean things up
            contact.CleanUp();

            // Ensure we have all valid data
            ModelState.Clear();
            Validate(contact);

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

            // If an existing contact
            if (contactID > 0)
            {
                // Then see if this contact has any pre-exiting invoices
                var dbInvoices = db.Invoices.Include(i => i.Buyer).Where(i => i.Buyer.CustomerID == contactID);

                // If the contact owns invoices
                if (dbInvoices.Any())
                {
                    // Then disown it from this user, and make a new one
                    dbContact.EmployeeID = Constants.DEVNULL_EMPLOYEE_ID;
                    contact.CustomerID = 0;

                    employee.Contacts.Add(contact);
                    contact.PreviousCustomerID = dbContact.CustomerID;
                }
                else
                {
                    dbContact.Address.StreetAddress = contact.Address.StreetAddress;
                    dbContact.Address.City = contact.Address.City;
                    dbContact.Address.State = contact.Address.State;
                    dbContact.Address.ZipCode = contact.Address.ZipCode;

                    dbContact.User.FirstName = contact.User.FirstName;
                    dbContact.User.LastName = contact.User.LastName;
                    dbContact.User.Email = contact.User.Email;

                    dbContact.PrimaryPhone = contact.PrimaryPhone;
                    dbContact.CellPhone = contact.CellPhone;
                    dbContact.HomePhone = contact.HomePhone;
                    dbContact.WorkPhone = contact.WorkPhone;

                    dbContact.CompanyName = contact.CompanyName;
                    dbContact.DealerLicenseNumber = contact.DealerLicenseNumber;
                    dbContact.MCNumber = contact.MCNumber;
                    dbContact.ResaleNumber = contact.ResaleNumber;
                }
            }
            // New contact
            else
            {
                // Should add it
                employee.Contacts = new List<Customer>() { contact };
            }

            try
            {
                db.SaveChanges();
                return new ApiResponse(true, $"Successfully saved contact, {contact.User.FullName()}");
            }
            catch (Exception ex)
            {
                return new ApiResponse(false, "An error occurred while saving the contact.\n" + ex.Message);
            }
        }

        [HttpDelete(nameof(DeleteContact) + "/{contactID}")]
        public ApiResponse DeleteContact(int contactID)
        {
            var employee = validateUser(Request, AccessPolicy.EditInvoicePrivilege);
            if (employee == null) return new ApiResponse(false, "Access Denied");

            var dbContact = db.Customers.Include(c => c.User)
                                        .Include(c => c.Address)
                                        .FirstOrDefault(c => c.EmployeeID == employee.EmployeeID &&
                                                             c.CustomerID == contactID);

            // Ensure the employee owns the contact
            if (contactID > 0 && dbContact == null)
            {
                return new ApiResponse(false, "Access Denied. You do not own this contact");
            }

            db.Entry(dbContact.Address).State = EntityState.Deleted;
            db.Entry(dbContact.User).State = EntityState.Deleted;
            db.Entry(dbContact).State = EntityState.Deleted;

            try
            {
                db.SaveChanges();
                return new ApiResponse(true, $"Successfully deleted {dbContact.User.FullName()}.");
            }
            catch
            {
                return new ApiResponse(false, $"Error when deleting {dbContact.User.FullName()}.");
            }
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
