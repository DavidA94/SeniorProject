using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.SecurityTypes;
using System;

namespace Seciovni.Web.Controllers
{
    [Authorize]
    public class InvoiceController : Controller
    {
        [Authorize(Policy = AccessPolicy.EditInvoicePrivilege)]
        public IActionResult Edit(int id = -1)
        {
            if(id == -1)
            {
                ViewData["Title"] = "New Invoice";
                return View(new Invoice()
                {
                    InvoiceID = -1,
                    InvoiceDate = DateTime.Now
                });
            }

            ViewData["Title"] = "Edit Invoice " + id.ToString("D4");
            ViewData["ShowSearch"] = true;
            return View(new Invoice()
            {
                InvoiceID = id,
            });
        }

        [Authorize(Policy = AccessPolicy.ViewInvoicePrivilege)]
        public IActionResult View(int id)
        {
            ViewData["ShowSearch"] = false;

            if (id > 0)
            {
                return View(new Invoice()
                {
                    InvoiceID = id
                });
            }
            else
            {
                return View("RecentInvoices");
            }
        }
    }
}
