using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

namespace InmuebleAplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InmueblesController : ControllerBase
    {
        private readonly string _storagePath = Path.Combine("C:", "Users", "DELL", "Desktop", "Inmuebles back", "Proyecto", "INMOBILIARIA", "IMG");

        public InmueblesController()
        {
            if (!Directory.Exists(_storagePath))
            {
                Directory.CreateDirectory(_storagePath);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFiles(IFormFileCollection files)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No se ha seleccionado ningún archivo.");

            foreach (var file in files)
            {
                // Usar el nombre del archivo enviado desde el cliente
                var fileName = Path.GetFileName(file.FileName); // El nombre ya viene personalizado desde el JS
                var filePath = Path.Combine(_storagePath, fileName);

                // Guardar el archivo en la carpeta local
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Aquí podrías guardar el nombre del archivo en la base de datos si lo necesitas
                // var inmueble = new Inmueble { FotoUrl = fileName };
                // _context.Inmuebles.Add(inmueble);
            }

            return Ok(new { Message = "Archivos cargados con éxito" });
        }
    }
}
