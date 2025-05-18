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

        [Required(ErrorMessage = "El documento INE es obligatorio")]
        [StringLength(500)]
        public string DocumentoINE { get; set; } = string.Empty;

        [Required(ErrorMessage = "El documento CURP es obligatorio")]
        [StringLength(500)]
        public string DocumentoCURP { get; set; } = string.Empty;

        [Required(ErrorMessage = "El comprobante de domicilio es obligatorio")]
        [StringLength(500)]
        public string DocumentoComprobanteDomicilio { get; set; } = string.Empty;

        [Required]
        public int PropertyId { get; set; }

        [Required(ErrorMessage = "El ID del usuario es obligatorio")]
        [ForeignKey("User")]
        public int UserId { get; set; }

        public User? User { get; set; }
    }
}
