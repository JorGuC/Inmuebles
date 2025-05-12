using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace InmuebleAplication.Models
{
    public class PropertyImage
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "El ID de la propiedad es obligatorio")]
        [ForeignKey("Property")]
        public int PropertyId { get; set; }
        [JsonIgnore]
        public Property? Property { get; set; } // Propiedad de navegación (nullable)

        [Required(ErrorMessage = "La URL de la imagen es obligatoria")]
        [StringLength(500, ErrorMessage = "La URL no puede exceder 500 caracteres")]
        public string ImageUrl { get; set; } = string.Empty;



    }
}
