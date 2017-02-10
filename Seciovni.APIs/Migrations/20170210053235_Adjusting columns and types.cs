using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Seciovni.APIs.Migrations
{
    public partial class Adjustingcolumnsandtypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Employees_EmployeeID",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Users_UserID",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Users_SalesPersonUserID",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "SalesPersonUserID",
                table: "Invoices",
                newName: "SalesPersonEmployeeID");

            migrationBuilder.RenameIndex(
                name: "IX_Invoices_SalesPersonUserID",
                table: "Invoices",
                newName: "IX_Invoices_SalesPersonEmployeeID");

            migrationBuilder.AlterColumn<int>(
                name: "UserID",
                table: "Employees",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeID",
                table: "Customers",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Employees_EmployeeID",
                table: "Customers",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Users_UserID",
                table: "Employees",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Employees_SalesPersonEmployeeID",
                table: "Invoices",
                column: "SalesPersonEmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Employees_EmployeeID",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Users_UserID",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Employees_SalesPersonEmployeeID",
                table: "Invoices");

            migrationBuilder.RenameColumn(
                name: "SalesPersonEmployeeID",
                table: "Invoices",
                newName: "SalesPersonUserID");

            migrationBuilder.RenameIndex(
                name: "IX_Invoices_SalesPersonEmployeeID",
                table: "Invoices",
                newName: "IX_Invoices_SalesPersonUserID");

            migrationBuilder.AlterColumn<int>(
                name: "UserID",
                table: "Employees",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeID",
                table: "Customers",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Employees_EmployeeID",
                table: "Customers",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Users_UserID",
                table: "Employees",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Users_SalesPersonUserID",
                table: "Invoices",
                column: "SalesPersonUserID",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
