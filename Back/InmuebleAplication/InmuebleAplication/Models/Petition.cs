using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InmuebleAplication.Models
{
    public class Petition
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [Required]
        [StringLength(10, MinimumLength = 10, ErrorMessage = "El teléfono debe tener 10 caracteres")]
        public string Telefono { get; set; } = string.Empty;

        public string Comentarios { get; set; } = string.Empty;

        public string? Documentos { get; set; } // Puede ser null o vacío

        [Required]
        public int PropertyId { get; set; }

        [Required(ErrorMessage = "El ID del usuario es obligatorio")]
        [ForeignKey("User")]
        public int UserId { get; set; } // Nueva propiedad para el ID del usuario

        public User? User { get; set; } // Propiedad de navegación opcional hacia el modelo User
    }
}