using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InmuebleAplication.Models;
using System.ComponentModel.DataAnnotations;
using Data;

namespace InmuebleAplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            // Validación manual (opcional si no usas [ApiController])
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validar email único
            if (_context.Users.Any(u => u.Email == user.Email))
            {
                return BadRequest(new { message = "El email ya está registrado por otro usuario." });
            }

            //Validar contraseña
            //if (user.Password.Length < 8)
            //{
            //    return BadRequest(new { message = "La contraseña debe contar con al menos 8 caracteres" });
            //}

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest("ID del usuario no coincide.");
            }

            // Validar email único (excluyendo al usuario actual)
            if (_context.Users.Any(u => u.Email == user.Email && u.Id != id))
            {
                return BadRequest(new { message = "El email ya está registrado por otro usuario." });
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Validar si el usuario tiene propiedades asociadas
            if (_context.Properties.Any(p => p.OwnerId == id))
            {
                return BadRequest("No se puede eliminar: El usuario tiene propiedades registradas.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == model.Email && u.Password == model.Password);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Credenciales inválidas." });
            }

            return Ok(user); // Puedes enviar solo algunos datos si prefieres
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}