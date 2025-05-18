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
        private readonly string _storagePathDocs = @"C:\Users\ariza\Documentos\inmuebles\Inmuebles\Front\Proyecto\INMOBILIARIA\DOCS";

        public PetitionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Petitions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Petition>> GetPetition(int id)
        {
            var petition = await _context.Petitions.FirstOrDefaultAsync(p => p.Id == id);

            if (petition == null)
                return NotFound();

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
            if (!_context.Properties.Any(p => p.Id == petition.PropertyId))
                return BadRequest("El PropertyId no corresponde a una propiedad válida");

            _context.Petitions.Add(petition);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPetition), new { id = petition.Id }, petition);
        }

        // GET: api/Petitions/vendedor/{ownerId}
        // GET: api/Petitions/vendedor/{ownerId}
        [HttpGet("vendedor/{ownerId}")]
        public async Task<IActionResult> GetPetitionsForOwner(int ownerId)
        {
            var properties = await _context.Properties
                .Where(p => p.OwnerId == ownerId)
                .ToListAsync();

            var propertyIds = properties.Select(p => p.Id).ToList();

            var petitions = await _context.Petitions
                .Where(p => propertyIds.Contains(p.PropertyId))
                .Include(p => p.User)
                .ToListAsync();

            var result = petitions.Select(p => new
            {
                propertyId = p.PropertyId,
                propertyTitle = properties.FirstOrDefault(prop => prop.Id == p.PropertyId)?.Title,
                nombre = p.Nombre,
                apellido = p.Apellido,
                telefono = p.Telefono,
                correo = p.Correo,
                comentarios = p.Comentarios,
                documentoINE = p.DocumentoINE,
                documentoCURP = p.DocumentoCURP,
                documentoComprobanteDomicilio = p.DocumentoComprobanteDomicilio
            });

            return Ok(result);
        }


        [HttpPost("upload-documents")]
        public async Task<IActionResult> UploadDocuments(IFormFileCollection files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No se ha seleccionado ningún documento.");

           

            if (!Directory.Exists(_storagePathDocs))
                Directory.CreateDirectory(_storagePathDocs);

            foreach (var file in files)
            {
                var fileName = Path.GetFileName(file.FileName);
                var filePath = Path.Combine(_storagePathDocs, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }

            return Ok(new { Message = "Documentos cargados exitosamente." });
        }


    }
}
