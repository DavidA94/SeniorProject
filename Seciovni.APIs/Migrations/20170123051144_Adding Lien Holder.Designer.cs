using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Seciovni.APIs.Contexts;
using Shared;

namespace Seciovni.APIs.Migrations
{
    [DbContext(typeof(SeciovniContext))]
    [Migration("20170123051144_Adding Lien Holder")]
    partial class AddingLienHolder
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.0-rtm-22752")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Database.Tables.Address", b =>
                {
                    b.Property<int>("AddressID")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("City")
                        .IsRequired();

                    b.Property<int>("Country");

                    b.Property<int>("CustomerID");

                    b.Property<string>("Locality");

                    b.Property<string>("State")
                        .IsRequired()
                        .HasMaxLength(2);

                    b.Property<string>("StreetAddress")
                        .IsRequired();

                    b.Property<string>("ZipCode")
                        .IsRequired();

                    b.HasKey("AddressID");

                    b.HasIndex("CustomerID")
                        .IsUnique();

                    b.ToTable("Address");
                });

            modelBuilder.Entity("Database.Tables.Customer", b =>
                {
                    b.Property<int>("CustomerID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("CompanyName");

                    b.Property<string>("DealerLicenseNumber");

                    b.Property<string>("Group");

                    b.Property<string>("MCNumber");

                    b.Property<string>("ResaleNumber");

                    b.Property<int?>("UserID");

                    b.HasKey("CustomerID");

                    b.HasIndex("UserID");

                    b.ToTable("Customers");
                });

            modelBuilder.Entity("Database.Tables.EmailAddress", b =>
                {
                    b.Property<string>("Email")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("CustomerID");

                    b.HasKey("Email");

                    b.HasIndex("CustomerID");

                    b.ToTable("EmailAddress");
                });

            modelBuilder.Entity("Database.Tables.Invoice", b =>
                {
                    b.Property<int>("InvoiceID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("BuyerCustomerID");

                    b.Property<decimal>("DocFee");

                    b.Property<decimal>("Downpayment");

                    b.Property<DateTime>("InvoiceDate");

                    b.Property<int?>("LienHolderLienID");

                    b.Property<int?>("SalesPersonUserID");

                    b.Property<int>("State");

                    b.Property<decimal>("TaxAmount");

                    b.HasKey("InvoiceID");

                    b.HasIndex("BuyerCustomerID");

                    b.HasIndex("LienHolderLienID");

                    b.HasIndex("SalesPersonUserID");

                    b.ToTable("Invoices");
                });

            modelBuilder.Entity("Database.Tables.InvoicePageTemplate", b =>
                {
                    b.Property<int>("TemplateID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("InvoiceID");

                    b.Property<int>("NumPages");

                    b.Property<int>("Orientation");

                    b.Property<string>("TemplateJSON");

                    b.Property<string>("TemplateTitle");

                    b.HasKey("TemplateID");

                    b.HasIndex("InvoiceID");

                    b.ToTable("InvoiceTemplates");
                });

            modelBuilder.Entity("Database.Tables.InvoiceTemplateBinding", b =>
                {
                    b.Property<int>("UniqueBindingID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("BindingID");

                    b.Property<string>("ColumnName");

                    b.Property<int?>("InvoicePageTemplateTemplateID");

                    b.Property<string>("TableName");

                    b.HasKey("UniqueBindingID", "BindingID");

                    b.HasAlternateKey("UniqueBindingID");


                    b.HasAlternateKey("BindingID", "UniqueBindingID");

                    b.HasIndex("InvoicePageTemplateTemplateID");

                    b.ToTable("InvoiceTemplateBinding");
                });

            modelBuilder.Entity("Database.Tables.LienHolder", b =>
                {
                    b.Property<int>("LienID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AddressID");

                    b.Property<string>("EIN");

                    b.Property<string>("Name");

                    b.HasKey("LienID");

                    b.HasIndex("AddressID");

                    b.ToTable("LienHolder");
                });

            modelBuilder.Entity("Database.Tables.ManyManyTables.InvoiceInvoicePageTemplate", b =>
                {
                    b.Property<int>("InvoiceID");

                    b.Property<int>("TemplateID");

                    b.HasKey("InvoiceID", "TemplateID");

                    b.HasIndex("TemplateID");

                    b.ToTable("InvoiceInvoicePageTemplate");
                });

            modelBuilder.Entity("Database.Tables.ManyManyTables.UserPermission", b =>
                {
                    b.Property<int>("UserID");

                    b.Property<string>("PermissionType");

                    b.HasKey("UserID", "PermissionType");

                    b.HasIndex("PermissionType");

                    b.ToTable("UserPermission");
                });

            modelBuilder.Entity("Database.Tables.MiscellaneousFee", b =>
                {
                    b.Property<int>("FeeID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Description")
                        .IsRequired();

                    b.Property<int?>("InvoiceID");

                    b.Property<decimal>("Price");

                    b.HasKey("FeeID");

                    b.HasIndex("InvoiceID");

                    b.ToTable("MiscellaneousFee");
                });

            modelBuilder.Entity("Database.Tables.Payment", b =>
                {
                    b.Property<int>("PaymentID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<decimal>("Amount");

                    b.Property<int?>("InvoiceID");

                    b.HasKey("PaymentID");

                    b.HasIndex("InvoiceID");

                    b.ToTable("Payment");
                });

            modelBuilder.Entity("Database.Tables.Permission", b =>
                {
                    b.Property<string>("PermissionType")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description")
                        .IsRequired();

                    b.HasKey("PermissionType");

                    b.ToTable("Permissions");
                });

            modelBuilder.Entity("Database.Tables.PhoneNumber", b =>
                {
                    b.Property<string>("Number")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("CustomerID");

                    b.Property<int>("Type");

                    b.HasKey("Number");

                    b.HasIndex("CustomerID");

                    b.ToTable("PhoneNumber");
                });

            modelBuilder.Entity("Database.Tables.User", b =>
                {
                    b.Property<int>("UserID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(30);

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(30);

                    b.HasKey("UserID");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Database.Tables.UserLogin", b =>
                {
                    b.Property<int>("LoginID")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTime>("InitialLoginTime");

                    b.Property<DateTime>("LastPingTime");

                    b.Property<string>("LoginToken");

                    b.Property<int?>("UserID");

                    b.HasKey("LoginID");

                    b.HasIndex("UserID");

                    b.ToTable("Logins");
                });

            modelBuilder.Entity("Database.Tables.VehicleInfo", b =>
                {
                    b.Property<string>("StockNum")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("InvoiceID");

                    b.Property<string>("Location");

                    b.Property<decimal>("Price");

                    b.Property<string>("VIN");

                    b.Property<int>("Year");

                    b.HasKey("StockNum");

                    b.HasIndex("InvoiceID");

                    b.ToTable("VehicleInfo");
                });

            modelBuilder.Entity("Database.Tables.Address", b =>
                {
                    b.HasOne("Database.Tables.Customer")
                        .WithOne("Address")
                        .HasForeignKey("Database.Tables.Address", "CustomerID")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Database.Tables.Customer", b =>
                {
                    b.HasOne("Database.Tables.User", "User")
                        .WithMany("Contacts")
                        .HasForeignKey("UserID");
                });

            modelBuilder.Entity("Database.Tables.EmailAddress", b =>
                {
                    b.HasOne("Database.Tables.Customer")
                        .WithMany("Emails")
                        .HasForeignKey("CustomerID");
                });

            modelBuilder.Entity("Database.Tables.Invoice", b =>
                {
                    b.HasOne("Database.Tables.Customer", "Buyer")
                        .WithMany()
                        .HasForeignKey("BuyerCustomerID");

                    b.HasOne("Database.Tables.LienHolder", "LienHolder")
                        .WithMany()
                        .HasForeignKey("LienHolderLienID");

                    b.HasOne("Database.Tables.User", "SalesPerson")
                        .WithMany()
                        .HasForeignKey("SalesPersonUserID");
                });

            modelBuilder.Entity("Database.Tables.InvoicePageTemplate", b =>
                {
                    b.HasOne("Database.Tables.Invoice")
                        .WithMany("PagesUsed")
                        .HasForeignKey("InvoiceID");
                });

            modelBuilder.Entity("Database.Tables.InvoiceTemplateBinding", b =>
                {
                    b.HasOne("Database.Tables.InvoicePageTemplate")
                        .WithMany("Bindings")
                        .HasForeignKey("InvoicePageTemplateTemplateID");
                });

            modelBuilder.Entity("Database.Tables.LienHolder", b =>
                {
                    b.HasOne("Database.Tables.Address", "Address")
                        .WithMany()
                        .HasForeignKey("AddressID");
                });

            modelBuilder.Entity("Database.Tables.ManyManyTables.InvoiceInvoicePageTemplate", b =>
                {
                    b.HasOne("Database.Tables.Invoice", "Invoice")
                        .WithMany("IIPT")
                        .HasForeignKey("InvoiceID")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Database.Tables.InvoicePageTemplate", "InvoicePageTempate")
                        .WithMany("IIPT")
                        .HasForeignKey("TemplateID")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Database.Tables.ManyManyTables.UserPermission", b =>
                {
                    b.HasOne("Database.Tables.Permission", "Permision")
                        .WithMany("UserPermissions")
                        .HasForeignKey("PermissionType")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Database.Tables.User", "User")
                        .WithMany("UserPermisions")
                        .HasForeignKey("UserID")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Database.Tables.MiscellaneousFee", b =>
                {
                    b.HasOne("Database.Tables.Invoice")
                        .WithMany("Fees")
                        .HasForeignKey("InvoiceID");
                });

            modelBuilder.Entity("Database.Tables.Payment", b =>
                {
                    b.HasOne("Database.Tables.Invoice")
                        .WithMany("Payments")
                        .HasForeignKey("InvoiceID");
                });

            modelBuilder.Entity("Database.Tables.PhoneNumber", b =>
                {
                    b.HasOne("Database.Tables.Customer")
                        .WithMany("PhoneNumbers")
                        .HasForeignKey("CustomerID");
                });

            modelBuilder.Entity("Database.Tables.UserLogin", b =>
                {
                    b.HasOne("Database.Tables.User", "User")
                        .WithMany()
                        .HasForeignKey("UserID");
                });

            modelBuilder.Entity("Database.Tables.VehicleInfo", b =>
                {
                    b.HasOne("Database.Tables.Invoice")
                        .WithMany("Vehicles")
                        .HasForeignKey("InvoiceID");
                });
        }
    }
}
