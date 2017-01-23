using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Seciovni.APIs.Migrations
{
    public partial class AddingLienHolder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LienHolderLienID",
                table: "Invoices",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LienHolder",
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
                    table.PrimaryKey("PK_LienHolder", x => x.LienID);
                    table.ForeignKey(
                        name: "FK_LienHolder_Address_AddressID",
                        column: x => x.AddressID,
                        principalTable: "Address",
                        principalColumn: "AddressID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_LienHolderLienID",
                table: "Invoices",
                column: "LienHolderLienID");

            migrationBuilder.CreateIndex(
                name: "IX_LienHolder_AddressID",
                table: "LienHolder",
                column: "AddressID");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_LienHolder_LienHolderLienID",
                table: "Invoices",
                column: "LienHolderLienID",
                principalTable: "LienHolder",
                principalColumn: "LienID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_LienHolder_LienHolderLienID",
                table: "Invoices");

            migrationBuilder.DropTable(
                name: "LienHolder");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_LienHolderLienID",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "LienHolderLienID",
                table: "Invoices");
        }
    }
}
