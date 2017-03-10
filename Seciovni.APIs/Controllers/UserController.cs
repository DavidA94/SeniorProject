using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seciovni.APIs.Contexts;
using System.Collections.Generic;
using System.Linq;
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
        public IEnumerable<Customer> Contacts()
        {
            ICollection<Customer> contacts = null;

            var token = Request.Headers.Authorization.Parameter.Replace("Bearer ", "");
            var user = db.Logins.Include(l => l.User)
                         .FirstOrDefault(l => l.LoginToken == token)
                        ?.User;

            var employee = db.Employees.FirstOrDefault(e => e.UserID == user.UserID);

            if (employee != null)
            {
                contacts = db.Customers.Include(c => c.Address)
                                       .Include(c => c.Emails)
                                       .Include(c => c.User)
                                       .Where(c => c.EmployeeID == employee.EmployeeID).ToList();
            }


            return contacts;
        }

        [HttpGet(nameof(ContactsPreview))]
        public IEnumerable<Customer> ContactsPreview()
        {
            var fullContacts = Contacts();
            var previewContacts = new List<Customer>();

            foreach (var contact in fullContacts)
            {
                previewContacts.Add(new Customer()
                {
                    CustomerID = contact.CustomerID,
                    Address = contact.Address,
                    CompanyName = contact.CompanyName,
                    User = new User()
                    {
                        FirstName = contact.User.FirstName,
                        LastName = contact.User.LastName,
                        Email = contact.User.Email,
                    }
                });
            }

            return previewContacts;
        }
    }
}
