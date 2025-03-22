using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using TiendaKeytlin.Server.Models;

namespace TiendaKeytlin.Server.Services
{
    public class PasswordResetService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly EmailService _emailService;

        public PasswordResetService(UserManager<IdentityUser> userManager, EmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return null;
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            return token;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            return result.Succeeded;
        }

        public async Task SendPasswordResetEmailAsync(string email, string callbackUrl)
        {
            var emailModel = new EmailModel
            {
                Email = email,
                Subject = "Restablecer contraseña",
                Message = $"Por favor restablece tu contraseña haciendo clic en este enlace: <a href='{callbackUrl}'>enlace</a>"
            };

            await _emailService.SendEmailAsync(emailModel);
        }
    }
}