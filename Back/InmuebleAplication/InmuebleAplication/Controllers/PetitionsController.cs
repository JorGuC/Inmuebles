using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InmuebleAplication.Models;
using Data;

namespace InmuebleAplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetitionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PetitionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Petitions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Petition>> GetPetition(int id)
        {
            var petition = await _context.Petitions
                .FirstOrDefaultAsync(p => p.Id == id);

            if (petition == null)
            {
                return NotFound();
            }

            return petition;
        }

        // GET: api/Petitions?userId={id}
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Petition>>> GetPetitionsByUserId([FromQuery] int userId)
        {
            var petitions = await _context.Petitions
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return Ok(petitions);
        }

        // POST: api/Petitions
        [HttpPost]
        public async Task<ActionResult<Petition>> PostPetition(Petition petition)
        {
            // Validar que el PropertyId exista
            if (!_context.Properties.Any(p => p.Id == petition.PropertyId))
            {
                return BadRequest("El PropertyId no corresponde a una propiedad válida");
            }

            _context.Petitions.Add(petition);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPetition), new { id = petition.Id }, petition);
        }
    }
}