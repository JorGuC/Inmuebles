using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InmuebleAplication.Migrations
{
    /// <inheritdoc />
    public partial class migracionCon3Docs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PetitionDocuments");

            migrationBuilder.DropColumn(
                name: "Documentos",
                table: "Petitions");

            migrationBuilder.AddColumn<string>(
                name: "DocumentoCURP",
                table: "Petitions",
                type: "varchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DocumentoComprobanteDomicilio",
                table: "Petitions",
                type: "varchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DocumentoINE",
                table: "Petitions",
                type: "varchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentoCURP",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "DocumentoComprobanteDomicilio",
                table: "Petitions");

            migrationBuilder.DropColumn(
                name: "DocumentoINE",
                table: "Petitions");

            migrationBuilder.AddColumn<string>(
                name: "Documentos",
                table: "Petitions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PetitionDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PetitionId = table.Column<int>(type: "int", nullable: false),
                    DocumentType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DocumentUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PetitionDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PetitionDocuments_Petitions_PetitionId",
                        column: x => x.PetitionId,
                        principalTable: "Petitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PetitionDocuments_PetitionId",
                table: "PetitionDocuments",
                column: "PetitionId");
        }
    }
}
