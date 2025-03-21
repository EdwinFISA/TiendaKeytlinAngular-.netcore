using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TiendaKeytlin.Server.Data;
using TiendaKeytlin.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace TiendaKeytlin.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)
        {
            _logger.LogInformation("Intento de inicio de sesión para el usuario: {Email}", login.Email);

            var usuario = await _context.Usuarios
                .Include(u => u.Estado)
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo == login.Email && u.Estado.Nombre == "Activo");

            if (usuario == null)
            {
                _logger.LogWarning("Usuario no encontrado o inactivo: {Email}", login.Email);
                return Unauthorized("Credenciales incorrectas");
            }

            if (usuario.Contrasena != login.Password)
            {
                _logger.LogWarning("Contraseña incorrecta para el usuario: {Email}", login.Email);
                return Unauthorized("Credenciales incorrectas");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nombre),
                new Claim(ClaimTypes.Role, usuario.Rol.Nombre),
                new Claim("Email", usuario.Correo)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            _logger.LogInformation("Inicio de sesión exitoso para el usuario: {Email}", login.Email);

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token)
            });
        }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}