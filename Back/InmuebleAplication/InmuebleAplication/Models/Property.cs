using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InmuebleAplication.Models
{
    public class Property
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "El dueño es obligatorio")]
        [ForeignKey("Owner")]
        public int OwnerId { get; set; }

        public User? Owner { get; set; }  // Propiedad de navegación

        [Required(ErrorMessage = "El título es obligatorio")]
        [StringLength(100, MinimumLength = 5)]
        public string Title { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a 0")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public string Location { get; set; }

        [Range(0, 20)]
        public int Bedrooms { get; set; }

        [Range(0, 10)]
        public int Bathrooms { get; set; }

        [Display(Name = "Medios baños")]
        [Range(0, 5)]
        public int HalfBathrooms { get; set; }

        public bool HasParking { get; set; } = false;
        public bool? IsReserved { get; set; } = null; 
        public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>(); 
    }
}