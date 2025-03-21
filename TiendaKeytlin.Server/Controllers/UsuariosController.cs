    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using TiendaKeytlin.Server.Data;
    using TiendaKeytlin.Server.Models;
    using System.Linq;
    using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace TiendaKeytlin.Server.Controllers
    {
        [Authorize]
        [Route("api/[controller]")]
        [ApiController]
        public class UsuarioController : ControllerBase
        {
            private readonly AppDbContext _context;

            public UsuarioController(AppDbContext context)
            {
                _context = context;
            }

            // GET: api/usuario
            [HttpGet]
            public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
            {
                return await _context.Usuarios.Include(u => u.Estado).Include(u => u.Rol).ToListAsync();
            }

            // GET: api/usuario/{id}
            [HttpGet("{id}")]
            public async Task<ActionResult<Usuario>> GetUsuario(int id)
            {
                var usuario = await _context.Usuarios.Include(u => u.Estado).Include(u => u.Rol).FirstOrDefaultAsync(u => u.Id == id);

                if (usuario == null)
                {
                    return NotFound();
                }

                return usuario;
            }

            // POST: api/usuario
            [HttpPost]
            public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
            {
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetUsuario", new { id = usuario.Id }, usuario);
            }

            // PUT: api/usuario/{id}
            [HttpPut("{id}")]
            public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
            {
                if (id != usuario.Id)
                {
                    return BadRequest();
                }

                _context.Entry(usuario).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!UsuarioExists(id))
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

            // DELETE: api/usuario/{id}
            [HttpDelete("{id}")]
            public async Task<IActionResult> DeleteUsuario(int id)
            {
                var usuario = await _context.Usuarios.FindAsync(id);
                if (usuario == null)
                {
                    return NotFound();
                }

                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();

                return NoContent();
            }

            private bool UsuarioExists(int id)
            {
                return _context.Usuarios.Any(e => e.Id == id);
            }
        }
    }


