using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Shared.SecurityTypes;
using Microsoft.AspNetCore.Authorization;

namespace Seciovni.Web.Controllers
{
    [Authorize(Policy = AccessPolicy.FormEditorPrivilege)]
    public class FormEditorController : Controller
    {
        public IActionResult Edit(string formName)
        {
            return View();
        }
    }
}
