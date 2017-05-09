using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.SecurityTypes;

namespace Seciovni.Web.Controllers
{
    [Authorize(Policy = AccessPolicy.AdminPrivilege)]
    public class ManagementController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
