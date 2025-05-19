using Data;
using InmuebleAplication.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InmuebleAplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyImageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PropertyImageController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/PropertyImage
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PropertyImage>>> GetAllImages()
        {
            return await _context.PropertyImages
                                 .Include(img => img.Property)
                                 .ToListAsync();
        }

        // GET: api/PropertyImage/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyImage>> GetImageById(int id)
        {
            var image = await _context.PropertyImages.FindAsync(id);
            if (image == null)
                return NotFound();

            return image;
        }

        // GET: api/PropertyImage/property/3
        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<PropertyImage>>> GetImagesByProperty(int propertyId)
        {
            var images = await _context.PropertyImages
                                       .Where(img => img.PropertyId == propertyId)
                                       .ToListAsync();

            return images;
        }

        // POST: api/PropertyImage
        [HttpPost]
        public async Task<ActionResult<PropertyImage>> CreateImage(PropertyImage image)
        {
            _context.PropertyImages.Add(image);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetImageById), new { id = image.Id }, image);
        }

        // PUT: api/PropertyImage/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateImage(int id, PropertyImage updatedImage)
        {
            if (id != updatedImage.Id)
                return BadRequest();

            _context.Entry(updatedImage).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.PropertyImages.Any(e => e.Id == id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // DELETE: api/PropertyImage/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var image = await _context.PropertyImages.FindAsync(id);
            if (image == null)
                return NotFound();

            _context.PropertyImages.Remove(image);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
