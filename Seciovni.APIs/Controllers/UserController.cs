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

            if (user != null)
            {
                contacts = db.Employees.Include(e => e.Contacts).ThenInclude(c => c.Address)
                                       .Include(e => e.Contacts).ThenInclude(c => c.User)
                                       .Include(e => e.Contacts).ThenInclude(c => c.PhoneNumbers)
                                       .Include(e => e.Contacts).ThenInclude(c => c.Emails)
                                       .FirstOrDefault(e => e.User == user)
                                      ?.Contacts;
            }


            return contacts;
        }

        [HttpGet(nameof(ContactsPreview))]
        public IEnumerable<Customer> ContactsPreview()
        {
            Context.Response.Cookies.Append("Test", "TesT", new Microsoft.AspNetCore.Http.CookieOptions()
            {
            });

            var fullContacts = Contacts();
            var previewContacts = new List<Customer>();

            foreach (var contact in fullContacts)
            {
                previewContacts.Add(new Customer()
                {
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
