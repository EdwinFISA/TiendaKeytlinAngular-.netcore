using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TiendaKeytlin.Server.Models;
using TiendaKeytlin.Server.Data;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace TiendaKeytlin.Server.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public string Authenticate(LoginDTO loginDTO)
        {
            // Incluir la relación con Rol
            var usuario = _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefault(u => u.Correo == loginDTO.Correo && u.Contrasena == loginDTO.Contrasena);

            if (usuario == null)
            {
                return null;
            }

            // Obtener el rol directamente si es necesario
            var rol = _context.Roles.Find(usuario.RolId);
            if (rol == null)
            {
                throw new InvalidOperationException("Rol no encontrado para el usuario");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, usuario.Correo),
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                    new Claim(ClaimTypes.Role, rol.Nombre) // Cambiado de Rol a Role
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginDTO
    {
        public string Correo { get; set; }
        public string Contrasena { get; set; }
    }
}