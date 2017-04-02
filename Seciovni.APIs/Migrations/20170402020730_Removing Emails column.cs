using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Seciovni.APIs.Migrations
{
    public partial class RemovingEmailscolumn : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceTemplates_Invoices_InvoiceID",
                table: "InvoiceTemplates");

            migrationBuilder.DropTable(
                name: "EmailAddress");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceTemplates_InvoiceID",
                table: "InvoiceTemplates");

            migrationBuilder.DropColumn(
                name: "InvoiceID",
                table: "InvoiceTemplates");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InvoiceID",
                table: "InvoiceTemplates",
                nullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTemplates_InvoiceID",
                table: "InvoiceTemplates",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_EmailAddress_CustomerID",
                table: "EmailAddress",
                column: "CustomerID");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceTemplates_Invoices_InvoiceID",
                table: "InvoiceTemplates",
                column: "InvoiceID",
                principalTable: "Invoices",
                principalColumn: "InvoiceID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
