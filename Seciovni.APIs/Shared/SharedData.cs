using Database.Tables;
using Shared;
using Shared.ApiResponses;
using System.Collections.Generic;

namespace Seciovni.APIs.Shared
{
    public static class SharedData
    {
        public static IEnumerable<BindingOptionData> GetBindingOptions(BindingOption option)
        {
            List<BindingOptionData> retVal = new List<BindingOptionData>();

            if (option == BindingOption.BOTH || option == BindingOption.REPEATING)
            {
                const string MISC_CHARGE = "Miscellaneous Charge";
                const string MISC_FEE = nameof(MiscellaneousFee);

                const string PAYMENT = nameof(Payment);

                const string VEHICLE = "Vehicle";
                const string VEHICLE_INFO = nameof(VehicleInfo);

                if (option != BindingOption.BOTH)
                {
                    retVal.InsertRange(0, new List<BindingOptionData>
                    {
                        new BindingOptionData(MISC_CHARGE, nameof(MiscellaneousFee.Description), MISC_FEE + "." + nameof(MiscellaneousFee.Description), BindingType.Text),
                        new BindingOptionData(MISC_CHARGE, nameof(MiscellaneousFee.Price), MISC_FEE + "." + nameof(MiscellaneousFee.Price), BindingType.Money),

                        new BindingOptionData(PAYMENT, nameof(Payment.Date), PAYMENT + "." + nameof(Payment.Date), BindingType.Date),
                        new BindingOptionData(PAYMENT, nameof(Payment.Description), PAYMENT + "." + nameof(Payment.Description), BindingType.Text),
                        new BindingOptionData(PAYMENT, nameof(Payment.Amount), PAYMENT + "." + nameof(Payment.Amount), BindingType.Money)
                    });
                }

                retVal.InsertRange(retVal.Count, new List<BindingOptionData>
                {
                    new BindingOptionData(VEHICLE, "Stock Number", VEHICLE_INFO + "." + nameof(VehicleInfo.StockNum), BindingType.Text),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.VIN), VEHICLE_INFO + "." + nameof(VehicleInfo.VIN), BindingType.Text),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Year), VEHICLE_INFO + "." + nameof(VehicleInfo.Year), BindingType.Number),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Make), VEHICLE_INFO + "." + nameof(VehicleInfo.Make), BindingType.Text),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Model), VEHICLE_INFO + "." + nameof(VehicleInfo.Model), BindingType.Text),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Miles), VEHICLE_INFO + "." + nameof(VehicleInfo.Miles), BindingType.Range),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Location), VEHICLE_INFO + "." + nameof(VehicleInfo.Location), BindingType.Text),
                    new BindingOptionData(VEHICLE, nameof(VehicleInfo.Price), VEHICLE_INFO + "." + nameof(VehicleInfo.Price), BindingType.Money),
                });
            }
            if (option == BindingOption.BOTH || option == BindingOption.SINGLE)
            {
                const string INVOICE = nameof(Invoice);
                const string BUYER = nameof(Invoice.Buyer);
                const string LIEN_HOLDER = nameof(Invoice.LienHolder);
                const string USER = nameof(Customer.User);
                const string ADDRESS = nameof(Customer.Address);
                const string COMPANY = "Company";

                retVal.InsertRange(0, new List<BindingOptionData>
                {
                    new BindingOptionData(COMPANY, "Street Address", "StreetAddress", BindingType.Text),
                    new BindingOptionData(COMPANY, "City", "City", BindingType.Text),
                    new BindingOptionData(COMPANY, "State", "CompanyState", BindingType.State),
                    new BindingOptionData(COMPANY, "ZIP", "ZIP", BindingType.Text),
                    new BindingOptionData(COMPANY, "Phone Number", "PhoneNumber", BindingType.Text),

                    new BindingOptionData(INVOICE, "Invoice Number", nameof(Invoice.InvoiceID), BindingType.Number),
                    new BindingOptionData(INVOICE, "Invoice Date", nameof(Invoice.InvoiceDate), BindingType.Date),
                    new BindingOptionData(INVOICE, "Invoice State", nameof(Invoice.State), BindingType.InvoiceState),
                    new BindingOptionData(INVOICE, "Sales Person", nameof(Invoice.SalesPerson), BindingType.Text),
                    new BindingOptionData(INVOICE, "Tax", nameof(Invoice.TaxAmount), BindingType.Money),
                    new BindingOptionData(INVOICE, "Doc Fee", nameof(Invoice.DocFee), BindingType.Money),
                    new BindingOptionData(INVOICE, "Down Payment", nameof(Invoice.DownPayment), BindingType.Money),
                    new BindingOptionData(INVOICE, "Invoice Total", "Total", BindingType.Money),
                    new BindingOptionData(INVOICE, "Amount Due", "Due", BindingType.Money),
                    new BindingOptionData(INVOICE, "Page Number", "PageNumber", BindingType.IGNORE),


                    new BindingOptionData(BUYER, "First Name", $"{BUYER}.{USER}.{nameof(User.FirstName)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Last Name", $"{BUYER}.{USER}.{nameof(User.LastName)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Company", $"{BUYER}.{nameof(Customer.CompanyName)}", BindingType.Text),
                    new BindingOptionData(BUYER, "E-Mail", $"{BUYER}.{USER}.{nameof(User.Email)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Primary Phone", $"{BUYER}.{nameof(Customer.PrimaryPhone)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Cell Phone", $"{BUYER}.{nameof(Customer.CellPhone)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Work Phone", $"{BUYER}.{nameof(Customer.WorkPhone)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Home Phone", $"{BUYER}.{nameof(Customer.HomePhone)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Street Address", $"{BUYER}.{ADDRESS}.{nameof(Address.StreetAddress)}", BindingType.Text),
                    new BindingOptionData(BUYER, "City", $"{BUYER}.{ADDRESS}.{nameof(Address.City)}", BindingType.Text),
                    new BindingOptionData(BUYER, "State", $"{BUYER}.{ADDRESS}.{nameof(Address.State)}", BindingType.State),
                    new BindingOptionData(BUYER, "ZIP", $"{BUYER}.{ADDRESS}.{nameof(Address.ZipCode)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Dealer License Number", $"{BUYER}.{nameof(Customer.DealerLicenseNumber)}", BindingType.Text),
                    new BindingOptionData(BUYER, "MC Number", $"{BUYER}.{nameof(Customer.MCNumber)}", BindingType.Text),
                    new BindingOptionData(BUYER, "Resale Number", $"{BUYER}.{nameof(Customer.ResaleNumber)}", BindingType.Text),

                    new BindingOptionData("Lien Holder", "Name", $"{LIEN_HOLDER}.{nameof(LienHolder.Name)}", BindingType.Text),
                    new BindingOptionData("Lien Holder", "Street Address", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.StreetAddress)}", BindingType.Text),
                    new BindingOptionData("Lien Holder", "City", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.City)}", BindingType.Text),
                    new BindingOptionData("Lien Holder", "State", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.State)}", BindingType.State),
                    new BindingOptionData("Lien Holder", "ZIP", $"{LIEN_HOLDER}.{ADDRESS}.{nameof(Address.ZipCode)}", BindingType.Text),
                    new BindingOptionData("Lien Holder", "EIN", $"{LIEN_HOLDER}.{nameof(LienHolder.EIN)}", BindingType.Text),
                });
            }

            return retVal;
        }
    }
}
