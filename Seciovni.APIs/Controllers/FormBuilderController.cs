using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Web.Http;
using Shared;
using Shared.ApiResponses;
using Database.Tables;

namespace Seciovni.APIs.Controllers
{
    [Route("api/[controller]")]
    public class FormBuilderController : ApiController
    {
        [HttpGet(nameof(BindingOptions) + "/{option}")]
        public IEnumerable<BindingOptionData> BindingOptions(BindingOption option)
        {
            List<BindingOptionData> retVal = new List<BindingOptionData>();
            
            if(option == BindingOption.BOTH || option == BindingOption.REPEATING)
            {
                const string MISC_CHARGE = "Miscellaneous Charge";
                const string MISC_FEE = nameof(MiscellaneousFee);

                const string PAYMENT = nameof(Payment);

                const string VEHICLE = "Vehicle";
                const string VEHICLE_INFO = nameof(VehicleInfo);

                retVal.InsertRange(0, new List<BindingOptionData>
                {
                    new BindingOptionData(MISC_CHARGE, nameof(MiscellaneousFee.Description), MISC_FEE + "." + nameof(MiscellaneousFee.Description)),
                    new BindingOptionData(MISC_CHARGE, nameof(MiscellaneousFee.Price), MISC_FEE + "." + nameof(MiscellaneousFee.Price)),

                    new BindingOptionData(PAYMENT, nameof(Payment.Date), PAYMENT + "." + nameof(Payment.Date)),
                    new BindingOptionData(PAYMENT, nameof(Payment.Description), PAYMENT + "." + nameof(Payment.Description)),
                    new BindingOptionData(PAYMENT, nameof(Payment.Amount), PAYMENT + "." + nameof(Payment.Amount)),

                    new BindingOptionData(VEHICLE, "Stock Number", VEHICLE_INFO + "." + nameof(VehicleInfo.StockNum)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.VIN), VEHICLE_INFO + "." + nameof(VehicleInfo.VIN)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Year), VEHICLE_INFO + "." + nameof(VehicleInfo.Year)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Make), VEHICLE_INFO + "." + nameof(VehicleInfo.Make)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Model), VEHICLE_INFO + "." + nameof(VehicleInfo.Model)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Miles), VEHICLE_INFO + "." + nameof(VehicleInfo.Miles)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Location), VEHICLE_INFO + "." + nameof(VehicleInfo.Location)),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Price), VEHICLE_INFO + "." + nameof(VehicleInfo.Price)),
                });
            }
            if (option == BindingOption.BOTH || option == BindingOption.SINGLE)
            {
                const string INVOICE = nameof(Invoice);
                const string BUYER = nameof(Invoice.Buyer);
                const string LIEN_HOLDER = nameof(Invoice.LienHolder);
                const string USER = nameof(Customer.User);
                const string ADDRESS = nameof(Customer.Address);

                retVal.InsertRange(0, new List<BindingOptionData>
                {
                    new BindingOptionData(INVOICE, "Invoice Number", INVOICE + "." + nameof(Invoice.InvoiceID)),
                    new BindingOptionData(INVOICE, "Invoice Date", INVOICE + "." + nameof(Invoice.InvoiceDate)),
                    new BindingOptionData(INVOICE, "Invoice State", INVOICE + "." + nameof(Invoice.State)),
                    new BindingOptionData(INVOICE, "Sales Person", INVOICE + "." + nameof(Invoice.SalesPerson)),
                    new BindingOptionData(INVOICE, "Tax", INVOICE + "." + nameof(Invoice.TaxAmount)),
                    new BindingOptionData(INVOICE, "Doc Fee", INVOICE + "." + nameof(Invoice.DocFee)),
                    new BindingOptionData(INVOICE, "Down Payment", INVOICE + "." + nameof(Invoice.DownPayment)),
                    new BindingOptionData(INVOICE, "Invoice Total", INVOICE + "." + "Total"),
                    new BindingOptionData(INVOICE, "Amount Due", INVOICE + "." + "Due"),


                    new BindingOptionData(BUYER, "First Name", $"{INVOICE}.{BUYER}.{USER}.{nameof(Database.Tables.User.FirstName)}"),
                    new BindingOptionData(BUYER, "Last Name", $"{INVOICE}.{BUYER}.{USER}.{nameof(Database.Tables.User.LastName)}"),
                    new BindingOptionData(BUYER, "Phone Number", $"{INVOICE}.{BUYER}.{nameof(Customer.CompanyName)}"),
                    new BindingOptionData(BUYER, "E-Mail", $"{INVOICE}.{BUYER}.{USER}.{nameof(Database.Tables.User.Email)}"),
                    new BindingOptionData(BUYER, "Phone Number", $"{INVOICE}.{BUYER}.{nameof(Customer.PhoneNumbers)}[0]"),
                    new BindingOptionData(BUYER, "Street Address", $"{INVOICE}.{BUYER}.{ADDRESS}.{nameof(Address.StreetAddress)}"),
                    new BindingOptionData(BUYER, "City", $"{INVOICE}.{BUYER}.{ADDRESS}.{nameof(Address.City)}"),
                    new BindingOptionData(BUYER, "State", $"{INVOICE}.{BUYER}.{ADDRESS}.{nameof(Address.State)}"),
                    new BindingOptionData(BUYER, "ZIP", $"{INVOICE}.{BUYER}.{ADDRESS}.{nameof(Address.ZipCode)}"),
                    new BindingOptionData(BUYER, "Dealer License Number", $"{INVOICE}.{BUYER}.{nameof(Customer.DealerLicenseNumber)}"),
                    new BindingOptionData(BUYER, "MC Number", $"{INVOICE}.{BUYER}.{nameof(Customer.MCNumber)}"),
                    new BindingOptionData(BUYER, "Resale Number", $"{INVOICE}.{BUYER}.{nameof(Customer.ResaleNumber)}"),

                    new BindingOptionData("Lien Holder", "Name", $"{INVOICE}.{LIEN_HOLDER}.{nameof(LienHolder.Name)}"),
                    new BindingOptionData("Lien Holder", "Street Address", $"{INVOICE}.{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.StreetAddress)}"),
                    new BindingOptionData("Lien Holder", "City", $"{INVOICE}.{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.City)}"),
                    new BindingOptionData("Lien Holder", "State", $"{INVOICE}.{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.State)}"),
                    new BindingOptionData("Lien Holder", "ZIP", $"{INVOICE}.{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.ZipCode)}"),
                    new BindingOptionData("Lien Holder", "EIN", $"{INVOICE}.{LIEN_HOLDER}.{nameof(LienHolder.EIN)}"),
                });
            }

            return retVal;
        }
    }
}
