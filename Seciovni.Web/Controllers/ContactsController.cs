using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.SecurityTypes;

namespace Seciovni.Web.Controllers
{
    [Authorize(Policy = AccessPolicy.EditInvoicePrivilege)]
    public class ContactsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
