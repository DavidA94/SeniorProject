using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Seciovni.APIs.Migrations
{
    public partial class AddingLienHoldertoDbSets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_LienHolder_LienHolderLienID",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_LienHolder_Address_AddressID",
                table: "LienHolder");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LienHolder",
                table: "LienHolder");

            migrationBuilder.RenameTable(
                name: "LienHolder",
                newName: "LienHolders");

            migrationBuilder.RenameIndex(
                name: "IX_LienHolder_AddressID",
                table: "LienHolders",
                newName: "IX_LienHolders_AddressID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LienHolders",
                table: "LienHolders",
                column: "LienID");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_LienHolders_LienHolderLienID",
                table: "Invoices",
                column: "LienHolderLienID",
                principalTable: "LienHolders",
                principalColumn: "LienID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LienHolders_Address_AddressID",
                table: "LienHolders",
                column: "AddressID",
                principalTable: "Address",
                principalColumn: "AddressID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_LienHolders_LienHolderLienID",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_LienHolders_Address_AddressID",
                table: "LienHolders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LienHolders",
                table: "LienHolders");

            migrationBuilder.RenameTable(
                name: "LienHolders",
                newName: "LienHolder");

            migrationBuilder.RenameIndex(
                name: "IX_LienHolders_AddressID",
                table: "LienHolder",
                newName: "IX_LienHolder_AddressID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LienHolder",
                table: "LienHolder",
                column: "LienID");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_LienHolder_LienHolderLienID",
                table: "Invoices",
                column: "LienHolderLienID",
                principalTable: "LienHolder",
                principalColumn: "LienID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LienHolder_Address_AddressID",
                table: "LienHolder",
                column: "AddressID",
                principalTable: "Address",
                principalColumn: "AddressID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
