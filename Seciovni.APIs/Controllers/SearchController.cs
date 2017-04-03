using Microsoft.AspNetCore.Mvc;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.Shared;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.SecurityTypes;
using System.Collections.Generic;
using System.Web.Http;

namespace Seciovni.APIs.Controllers
{
    [Route("api/[controller]")]
    public class SearchController : ApiController
    {
        private SeciovniContext db;

        public SearchController(SeciovniContext context)
        {
            db = context;
        }

        [HttpGet(nameof(SearchFields))]
        public IEnumerable<BindingOptionData> SearchFields()
        {
            if (Request.HasValidLogin(db) && Request.CanAccess(db, AccessPolicy.ViewInvoicePrivilege))
            {
                return SharedData.GetBindingOptions(BindingOption.BOTH);
            }

            return null;
        }
    }
}
