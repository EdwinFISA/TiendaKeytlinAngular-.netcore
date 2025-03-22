using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TiendaKeytlin.Server.Models;
using TiendaKeytlin.Server.Services;

namespace TiendaKeytlin.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PasswordResetController : ControllerBase
    {
        private readonly PasswordResetService _passwordResetService;

        public PasswordResetController(PasswordResetService passwordResetService)
        {
            _passwordResetService = passwordResetService;
        }

        [HttpPost("forgot")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var token = await _passwordResetService.GeneratePasswordResetTokenAsync(model.Email);
            if (token == null)
            {
                return NotFound("Usuario no encontrado");
            }

            // Enviar correo electrónico con el token de restablecimiento de contraseña
            var callbackUrl = Url.Action("ResetPassword", "PasswordReset", new { token, email = model.Email }, Request.Scheme);
            await _passwordResetService.SendPasswordResetEmailAsync(model.Email, callbackUrl);

            return Ok("Correo de restablecimiento de contraseña enviado.");
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _passwordResetService.ResetPasswordAsync(model);
            if (!result)
            {
                return BadRequest("Error al restablecer la contraseña.");
            }

            return Ok("Contraseña restablecida con éxito.");
        }
    }
}