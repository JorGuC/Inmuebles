    using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InmuebleAplication.Migrations
{
    /// <inheritdoc />
    public partial class fechas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "Petitions",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "Petitions");
        }
    }
}
