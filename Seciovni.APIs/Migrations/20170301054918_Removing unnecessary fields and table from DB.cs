using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Seciovni.APIs.Migrations
{
    public partial class RemovingunnecessaryfieldsandtablefromDB : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvoiceTemplateBinding");

            migrationBuilder.DropColumn(
                name: "NumPages",
                table: "InvoiceTemplates");

            migrationBuilder.DropColumn(
                name: "Orientation",
                table: "InvoiceTemplates");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumPages",
                table: "InvoiceTemplates",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Orientation",
                table: "InvoiceTemplates",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTemplateBinding_InvoicePageTemplateTemplateID",
                table: "InvoiceTemplateBinding",
                column: "InvoicePageTemplateTemplateID");
        }
    }
}
