using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Seciovni.APIs.Migrations
{
    public partial class AddingMakeModelandMiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Make",
                table: "VehicleInfo",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Miles",
                table: "VehicleInfo",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "VehicleInfo",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Make",
                table: "VehicleInfo");

            migrationBuilder.DropColumn(
                name: "Miles",
                table: "VehicleInfo");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "VehicleInfo");
        }
    }
}
