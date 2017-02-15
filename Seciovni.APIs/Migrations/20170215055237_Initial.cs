using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Seciovni.APIs.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Address",
                columns: table => new
                {
                    AddressID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    City = table.Column<string>(nullable: false),
                    Country = table.Column<int>(nullable: false),
                    Locality = table.Column<string>(nullable: true),
                    State = table.Column<string>(maxLength: 2, nullable: false),
                    StreetAddress = table.Column<string>(nullable: false),
                    ZipCode = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Address", x => x.AddressID);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    PermissionType = table.Column<string>(nullable: false),
                    Description = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionType);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Email = table.Column<string>(maxLength: 50, nullable: false),
                    FirstName = table.Column<string>(maxLength: 30, nullable: false),
                    LastName = table.Column<string>(maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "LienHolders",
                columns: table => new
                {
                    LienID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AddressID = table.Column<int>(nullable: true),
                    EIN = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LienHolders", x => x.LienID);
                    table.ForeignKey(
                        name: "FK_LienHolders_Address_AddressID",
                        column: x => x.AddressID,
                        principalTable: "Address",
                        principalColumn: "AddressID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    EmployeeID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Job = table.Column<int>(nullable: false),
                    UserID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.EmployeeID);
                    table.ForeignKey(
                        name: "FK_Employees_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPermission",
                columns: table => new
                {
                    UserID = table.Column<int>(nullable: false),
                    PermissionType = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermission", x => new { x.UserID, x.PermissionType });
                    table.ForeignKey(
                        name: "FK_UserPermission_Permissions_PermissionType",
                        column: x => x.PermissionType,
                        principalTable: "Permissions",
                        principalColumn: "PermissionType",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermission_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Logins",
                columns: table => new
                {
                    LoginID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    InitialLoginTime = table.Column<DateTime>(nullable: false),
                    LastPingTime = table.Column<DateTime>(nullable: false),
                    LoginToken = table.Column<string>(nullable: true),
                    UserID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Logins", x => x.LoginID);
                    table.ForeignKey(
                        name: "FK_Logins_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AddressID = table.Column<int>(nullable: true),
                    CompanyName = table.Column<string>(nullable: true),
                    DealerLicenseNumber = table.Column<string>(nullable: true),
                    EmployeeID = table.Column<int>(nullable: false),
                    Group = table.Column<string>(nullable: true),
                    MCNumber = table.Column<string>(nullable: true),
                    ResaleNumber = table.Column<string>(nullable: true),
                    UserID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.CustomerID);
                    table.ForeignKey(
                        name: "FK_Customers_Address_AddressID",
                        column: x => x.AddressID,
                        principalTable: "Address",
                        principalColumn: "AddressID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Customers_Employees_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Customers_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmailAddress",
                columns: table => new
                {
                    Email = table.Column<string>(nullable: false),
                    CustomerID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailAddress", x => x.Email);
                    table.ForeignKey(
                        name: "FK_EmailAddress_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    InvoiceID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BuyerCustomerID = table.Column<int>(nullable: false),
                    DocFee = table.Column<decimal>(nullable: false),
                    DownPayment = table.Column<decimal>(nullable: false),
                    InvoiceDate = table.Column<DateTime>(nullable: false),
                    LienHolderLienID = table.Column<int>(nullable: true),
                    SalesPersonEmployeeID = table.Column<int>(nullable: true),
                    State = table.Column<int>(nullable: false),
                    TaxAmount = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.InvoiceID);
                    table.ForeignKey(
                        name: "FK_Invoices_Customers_BuyerCustomerID",
                        column: x => x.BuyerCustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Invoices_LienHolders_LienHolderLienID",
                        column: x => x.LienHolderLienID,
                        principalTable: "LienHolders",
                        principalColumn: "LienID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invoices_Employees_SalesPersonEmployeeID",
                        column: x => x.SalesPersonEmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PhoneNumber",
                columns: table => new
                {
                    PhoneID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CustomerID = table.Column<int>(nullable: true),
                    Number = table.Column<string>(nullable: true),
                    Type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhoneNumber", x => x.PhoneID);
                    table.ForeignKey(
                        name: "FK_PhoneNumber_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceTemplates",
                columns: table => new
                {
                    TemplateID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    InvoiceID = table.Column<int>(nullable: true),
                    NumPages = table.Column<int>(nullable: false),
                    Orientation = table.Column<int>(nullable: false),
                    TemplateJSON = table.Column<string>(nullable: true),
                    TemplateTitle = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceTemplates", x => x.TemplateID);
                    table.ForeignKey(
                        name: "FK_InvoiceTemplates_Invoices_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MiscellaneousFee",
                columns: table => new
                {
                    FeeID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Description = table.Column<string>(nullable: false),
                    InvoiceID = table.Column<int>(nullable: true),
                    Price = table.Column<decimal>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MiscellaneousFee", x => x.FeeID);
                    table.ForeignKey(
                        name: "FK_MiscellaneousFee_Invoices_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    PaymentID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<decimal>(nullable: false),
                    Date = table.Column<DateTime>(nullable: false),
                    Description = table.Column<string>(nullable: false),
                    InvoiceID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_Payment_Invoices_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VehicleInfo",
                columns: table => new
                {
                    StockNum = table.Column<string>(nullable: false),
                    InvoiceID = table.Column<int>(nullable: true),
                    Location = table.Column<string>(nullable: false),
                    Make = table.Column<string>(nullable: false),
                    Miles = table.Column<int>(nullable: false),
                    Model = table.Column<string>(nullable: false),
                    Price = table.Column<decimal>(nullable: false),
                    VIN = table.Column<string>(nullable: true),
                    Year = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleInfo", x => x.StockNum);
                    table.ForeignKey(
                        name: "FK_VehicleInfo_Invoices_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceTemplateBinding",
                columns: table => new
                {
                    UniqueBindingID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BindingID = table.Column<string>(nullable: false),
                    ColumnName = table.Column<string>(nullable: true),
                    InvoicePageTemplateTemplateID = table.Column<int>(nullable: true),
                    TableName = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceTemplateBinding", x => new { x.UniqueBindingID, x.BindingID });
                    table.UniqueConstraint("AK_InvoiceTemplateBinding_UniqueBindingID", x => x.UniqueBindingID);
                    table.UniqueConstraint("AK_InvoiceTemplateBinding_BindingID_UniqueBindingID", x => new { x.BindingID, x.UniqueBindingID });
                    table.ForeignKey(
                        name: "FK_InvoiceTemplateBinding_InvoiceTemplates_InvoicePageTemplateTemplateID",
                        column: x => x.InvoicePageTemplateTemplateID,
                        principalTable: "InvoiceTemplates",
                        principalColumn: "TemplateID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceInvoicePageTemplate",
                columns: table => new
                {
                    InvoiceID = table.Column<int>(nullable: false),
                    TemplateID = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceInvoicePageTemplate", x => new { x.InvoiceID, x.TemplateID });
                    table.ForeignKey(
                        name: "FK_InvoiceInvoicePageTemplate_Invoices_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceInvoicePageTemplate_InvoiceTemplates_TemplateID",
                        column: x => x.TemplateID,
                        principalTable: "InvoiceTemplates",
                        principalColumn: "TemplateID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_AddressID",
                table: "Customers",
                column: "AddressID");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_EmployeeID",
                table: "Customers",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserID",
                table: "Customers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_EmailAddress_CustomerID",
                table: "EmailAddress",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UserID",
                table: "Employees",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_BuyerCustomerID",
                table: "Invoices",
                column: "BuyerCustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_LienHolderLienID",
                table: "Invoices",
                column: "LienHolderLienID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_SalesPersonEmployeeID",
                table: "Invoices",
                column: "SalesPersonEmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTemplates_InvoiceID",
                table: "InvoiceTemplates",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTemplateBinding_InvoicePageTemplateTemplateID",
                table: "InvoiceTemplateBinding",
                column: "InvoicePageTemplateTemplateID");

            migrationBuilder.CreateIndex(
                name: "IX_LienHolders_AddressID",
                table: "LienHolders",
                column: "AddressID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceInvoicePageTemplate_TemplateID",
                table: "InvoiceInvoicePageTemplate",
                column: "TemplateID");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermission_PermissionType",
                table: "UserPermission",
                column: "PermissionType");

            migrationBuilder.CreateIndex(
                name: "IX_MiscellaneousFee_InvoiceID",
                table: "MiscellaneousFee",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_InvoiceID",
                table: "Payment",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_PhoneNumber_CustomerID",
                table: "PhoneNumber",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Logins_UserID",
                table: "Logins",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleInfo_InvoiceID",
                table: "VehicleInfo",
                column: "InvoiceID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailAddress");

            migrationBuilder.DropTable(
                name: "InvoiceTemplateBinding");

            migrationBuilder.DropTable(
                name: "InvoiceInvoicePageTemplate");

            migrationBuilder.DropTable(
                name: "UserPermission");

            migrationBuilder.DropTable(
                name: "MiscellaneousFee");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "PhoneNumber");

            migrationBuilder.DropTable(
                name: "Logins");

            migrationBuilder.DropTable(
                name: "VehicleInfo");

            migrationBuilder.DropTable(
                name: "InvoiceTemplates");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "LienHolders");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Address");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
