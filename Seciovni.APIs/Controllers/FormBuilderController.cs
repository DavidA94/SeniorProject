using Database.Tables;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Seciovni.APIs.Contexts;
using Seciovni.APIs.Shared;
using Seciovni.APIs.WebHelpers;
using Shared;
using Shared.ApiResponses;
using Shared.FormBuilderObjects;
using Shared.FormBuilderObjects.FBObjects;
using Shared.SecurityTypes;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace Seciovni.APIs.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class FormBuilderController : ApiController
    {
        private SeciovniContext db;

        public FormBuilderController(SeciovniContext context)
        {
            db = context;
        }

        #region GET

        [HttpGet(nameof(BindingOptions) + "/{option}")]
        public IEnumerable<BindingOptionData> BindingOptions(BindingOption option)
        {
            if(Request.HasValidLogin(db) && Request.CanAccess(db, AccessPolicy.FormEditorPrivilege))
            {
                return SharedData.GetBindingOptions(option);
            }

            return null;
        }

        [HttpGet(nameof(FormImages))]
        public IEnumerable<string> FormImages()
        {
            if (Request.HasValidLogin(db) && Request.CanAccess(db, AccessPolicy.FormEditorPrivilege))
            {
                return Directory.GetFiles(Constants.API_ROOT_IMG_FOLDER, "*.png").Union(
                    Directory.GetFiles(Constants.API_ROOT_IMG_FOLDER, "*.jpeg")).Select(s => s.Replace("wwwroot\\", "")
                                                                                              .Replace("\\", "/"));
            }

            return null;
        }

        [HttpGet(nameof(Get) + "/{pageName}")]
        public string Get(string pageName)
        {
            // If we don't have a valid request, then no-go
            if (!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.FormEditorPrivilege)) return null;

            return db.InvoiceTemplates.LastOrDefault(t => t.TemplateTitle.ToLower().Replace(" ", "") == 
                                                                 pageName.ToLower().Replace(" ", ""))?.TemplateJSON;
        }

        [HttpGet(nameof(GetForms))]
        public IEnumerable<string> GetForms()
        {
            // If we don't have a valid request, then no-go
            if (!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.FormEditorPrivilege)) return null;

            return db.InvoiceTemplates.Select(it => it.TemplateTitle).Distinct();
        }

        #endregion

        #region POST

        [HttpPost(nameof(Save))]
        public ApiResponse Save()
        {
            if (!Request.HasValidLogin(db) || !Request.CanAccess(db, AccessPolicy.FormEditorPrivilege))
            {
                return new ApiResponse(false, "Permission Denied");
            }
            
            InvoicePageTemplate template = null;
            bool overwrite = false;

            // Parse the JSON so we can get the Title, and check for binding errors
            var requestJSON = Request.Content.ReadAsStringAsync().Result;
            FormBuilder fb = JsonConvert.DeserializeObject<FormBuilder>(requestJSON,
                new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.Auto });

            // Ensure there are no binding errors
            if (hasBindingError(fb)) return new ApiResponse(false, "One or more binding errors have been found");

            // Get the "page" that submitted this -- [null = new template]
            var pageName = WebUtility.UrlDecode(Request.Headers.Referrer.Segments.Last());
            if (pageName.Trim('/').Trim().ToLower() == "edit") pageName = null;

            // Try to get the template from the database

            if (pageName != null)
            {
                template = db.InvoiceTemplates
                             .Include(t => t.IIPT)
                             .LastOrDefault(t => t.TemplateTitle.ToLower().Replace(" ", "") == pageName.ToLower().Replace(" ", ""));
            }

            // New Template
            if (pageName == null)
            {
                // Duplicate Name
                if (template != null)
                {
                    // No header = Prompt User
                    if (!Request.Headers.Contains(Constants.OVERWRITE_HEADER))
                    {
                        return new ApiResponse(false, "Overwrite?");
                    }
                    // Has header to overwrite
                    else
                    {
                        overwrite = true;
                    }
                }
            }
            // Edit Template
            else
            {
                // No template = ERROR
                if (template == null) return new ApiResponse(false, "Bad Request");
                else
                {
                    overwrite = true;
                }
            }

            // If we're set to overwerite, but there are things already using the template, then don't overwrite
            if (overwrite && template.IIPT.Count > 0)
            {
                overwrite = false;
            }

            // Create new
            if (!overwrite)
            {
                db.InvoiceTemplates.Add(new InvoicePageTemplate
                {
                    TemplateTitle = fb.Title,
                    TemplateJSON = requestJSON,
                    States = fb.States
                });
            }
            // Edit what's already there
            else
            {
                template.TemplateTitle = fb.Title;
                template.TemplateJSON = requestJSON;
                template.States = fb.States;
            }

            // To to save the changes
            try
            {
                if (db.SaveChanges() > 0)
                {
                    return new ApiResponse(true, "Successfully Saved");
                }

                return new ApiResponse(true, "Nothing to save");
            }
            catch (Exception ex)
            {
                string message = "An error occurred while saving the invoice: " + ex.Message;
                if (ex.InnerException != null)
                {
                    message += "\n\n" + ex.InnerException.Message;
                }

                return new ApiResponse(false, message);
            }
        }

        #endregion

        #region Helpers

        private bool hasBindingError(FormBuilder fb)
        {
            // Check if there are any binding errors
            bool hasBindingError = false;

            foreach (var shape in fb.Canvas.Shapes)
            {
                if (shape is Table)
                {
                    foreach (var col in (shape as Table).Cells)
                    {
                        hasBindingError |= col["header"].HasBindingError;
                        hasBindingError |= col["content"].HasBindingError;
                    }
                }
                if (shape is FBTextBlock)
                {
                    hasBindingError |= (shape as FBTextBlock).TextBlock.HasBindingError;
                }
            }

            return hasBindingError;
        }

        #endregion
    }
}
