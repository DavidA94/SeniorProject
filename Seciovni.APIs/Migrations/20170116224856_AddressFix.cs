using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Seciovni.APIs.Migrations
{
    public partial class AddressFix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Address",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Country",
                table: "Address",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Locality",
                table: "Address",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Address",
                maxLength: 2,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StreetAddress",
                table: "Address",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                table: "Address",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Address");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Address");

            migrationBuilder.DropColumn(
                name: "Locality",
                table: "Address");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Address");

            migrationBuilder.DropColumn(
                name: "StreetAddress",
                table: "Address");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                table: "Address");
        }
    }
}
