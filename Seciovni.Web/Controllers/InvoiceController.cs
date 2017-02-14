using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Database.Tables;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Seciovni.Web.Controllers
{
    public class InvoiceController : Controller
    {
        // GET: /<controller>/<id> -- Editing an existing invoice
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

            ViewData["Title"] = "Invoice " + id;
            return View(new Invoice()
            {
                InvoiceID = id,
            });
        }

        // GET: /<controller>/<id> -- View a static invoice
        public IActionResult View(int id)
        {
            return View(new Invoice()
            {
                InvoiceID = id,
                InvoiceDate = DateTime.Now,
                Vehicles = new List<VehicleInfo> { new VehicleInfo() { Miles = 0 } }
            });
        }
    }
}
