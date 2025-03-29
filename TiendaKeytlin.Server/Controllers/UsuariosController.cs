using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TiendaKeytlin.Server.Data;
using TiendaKeytlin.Server.Models;
using TiendaKeytlin.Server.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TiendaKeytlin.Server.DTOs;

namespace TiendaKeytlin.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly ILogger<UsuarioController> _logger;

        public UsuarioController(
            AppDbContext context,
            EmailService emailService,
            ILogger<UsuarioController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        // GET: api/usuario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            try
            {
                _logger.LogInformation("Obteniendo lista de usuarios");
                var usuarios = await _context.Usuarios
                    .Include(u => u.Estado)
                    .Include(u => u.Rol)
                    .ToListAsync();

                // Mapeamos los datos para incluir solo el nombre del estado y rol
                var usuariosResponse = usuarios.Select(usuario => new
                {
                    usuario.Id,
                    usuario.Nombre,
                    usuario.Apellido,
                    usuario.Correo,
                    usuario.Telefono,
                    usuario.FechaCreacion,
                    Estado = usuario.Estado.Nombre,  // Aquí obtenemos el nombre del estado
                    Rol = usuario.Rol.Nombre         // Aquí obtenemos el nombre del rol
                }).ToList();

                return Ok(usuariosResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener usuarios: {ex.Message}");
                return StatusCode(500, "Error interno al obtener la lista de usuarios");
            }
        }

        // GET: api/usuario/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            try
            {
                _logger.LogInformation($"Buscando usuario con ID: {id}");
                var usuario = await _context.Usuarios
                    .Include(u => u.Estado)
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (usuario == null)
                {
                    _logger.LogWarning($"Usuario con ID {id} no encontrado");
                    return NotFound($"No se encontró el usuario con ID {id}");
                }

                return usuario;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener usuario {id}: {ex.Message}");
                return StatusCode(500, "Error interno al obtener el usuario");
            }
        }

        // POST: api/usuario
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario([FromBody] UsuarioCreateDto usuarioDto)
        {
            try
            {
                _logger.LogInformation($"Iniciando creación de usuario: {usuarioDto.Correo}");

                // Validaciones
                if (string.IsNullOrEmpty(usuarioDto.Correo))
                {
                    _logger.LogWarning("Intento de crear usuario sin correo electrónico");
                    return BadRequest("El correo electrónico es obligatorio.");
                }

                if (string.IsNullOrEmpty(usuarioDto.Contrasena))
                {
                    _logger.LogWarning($"Intento de crear usuario {usuarioDto.Correo} sin contraseña");
                    return BadRequest("La contraseña es obligatoria.");
                }

                if (string.IsNullOrEmpty(usuarioDto.Nombre) || string.IsNullOrEmpty(usuarioDto.Apellido))
                {
                    return BadRequest("El nombre y apellido son obligatorios.");
                }

                // Verificar si el usuario ya existe
                var usuarioExistente = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Correo == usuarioDto.Correo);

                if (usuarioExistente != null)
                {
                    _logger.LogWarning($"Intento de crear usuario con correo duplicado: {usuarioDto.Correo}");
                    return BadRequest("El correo electrónico ya está registrado.");
                }

                // Crear un nuevo usuario a partir del DTO
                var usuario = new Usuario
                {
                    Nombre = usuarioDto.Nombre,
                    Apellido = usuarioDto.Apellido,
                    Correo = usuarioDto.Correo,
                    Contrasena = usuarioDto.Contrasena,
                    Telefono = usuarioDto.Telefono,
                    EstadoId = usuarioDto.EstadoId,
                    RolId = usuarioDto.RolId,
                    FechaCreacion = DateTime.UtcNow
                };

                _logger.LogInformation($"Guardando usuario: {usuario.Correo}");
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                // Enviar correo electrónico
                try
                {
                    var emailModel = new EmailModel
                    {
                        Email = usuario.Correo,
                        Subject = "Bienvenido a TiendaKeytlin",
                        Message = $"Hola {usuario.Nombre},\n\n" +
                                  $"Tu cuenta ha sido creada exitosamente. " +
                                  $"Tu contraseña es: {usuario.Contrasena}\n\n" +
                                  "Por favor, cambia tu contraseña después de iniciar sesión."
                    };

                    await _emailService.SendEmailAsync(emailModel);
                    _logger.LogInformation($"Correo de bienvenida enviado a: {usuario.Correo}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error al enviar correo a {usuario.Correo}: {ex.Message}");
                }

                // Crear una versión limpia del usuario para la respuesta
                var usuarioResponse = new
                {
                    usuario.Id,
                    usuario.Nombre,
                    usuario.Apellido,
                    usuario.Correo,
                    usuario.Telefono,
                    usuario.FechaCreacion,
                    usuario.Estado,
                    usuario.Rol
                };

                return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuarioResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear usuario: {ex.Message}");
                return StatusCode(500, "Error interno del servidor al crear el usuario");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, [FromBody] UsuarioUpdateDto usuarioDto)
        {
            try
            {
                if (id != usuarioDto.Id)
                {
                    _logger.LogWarning($"ID no coincidente en actualización: {id} vs {usuarioDto.Id}");
                    return BadRequest("El ID no coincide con el usuario a actualizar");
                }

                var usuarioExistente = await _context.Usuarios.FindAsync(id);
                if (usuarioExistente == null)
                {
                    _logger.LogWarning($"Intento de actualizar usuario inexistente: {id}");
                    return NotFound($"No se encontró el usuario con ID {id}");
                }

                // Actualizar solo los campos permitidos (excluyendo Contrasena)
                usuarioExistente.Nombre = usuarioDto.Nombre;
                usuarioExistente.Apellido = usuarioDto.Apellido;
                usuarioExistente.Correo = usuarioDto.Correo;
                usuarioExistente.Telefono = usuarioDto.Telefono;
                usuarioExistente.EstadoId = usuarioDto.EstadoId;
                usuarioExistente.RolId = usuarioDto.RolId;

                // No actualizar la contraseña bajo ningún concepto
                // El campo Contrasena ni siquiera debería venir en el DTO

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Usuario actualizado correctamente: {id}");

                return NoContent();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError($"Error de concurrencia al actualizar usuario {id}: {ex.Message}");
                return StatusCode(409, "Error de concurrencia al actualizar el usuario");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al actualizar usuario {id}: {ex.Message}");
                return StatusCode(500, "Error interno al actualizar el usuario");
            }
        }

        // DELETE: api/usuario/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            try
            {
                var usuario = await _context.Usuarios.FindAsync(id);
                if (usuario == null)
                {
                    _logger.LogWarning($"Intento de eliminar usuario inexistente: {id}");
                    return NotFound($"No se encontró el usuario con ID {id}");
                }

                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Usuario eliminado correctamente: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al eliminar usuario {id}: {ex.Message}");
                return StatusCode(500, "Error interno al eliminar el usuario");
            }
        }

        private bool UsuarioExists(int id)
        {
            return _context.Usuarios.Any(e => e.Id == id);
        }
    }
}