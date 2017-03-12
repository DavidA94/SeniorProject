using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.SecurityTypes;

namespace Seciovni.Web.Controllers
{
    [Authorize(Policy = AccessPolicy.FormEditorPrivilege)]
    public class FormEditorController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Edit(string formName)
        {
            return View();
        }
    }
}
