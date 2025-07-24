using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartFeedbackAPI.Migrations
{
    /// <inheritdoc />
    public partial class AdminController : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Img",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "Feedbacks",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Img",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "Feedbacks");
        }
    }
}
