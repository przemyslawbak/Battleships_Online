using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    public class ResetPasswordViewModel
    {
        [Required(ErrorMessage = "Please fill up your new password.")]
        public string Password { get; set; }
        [Required(ErrorMessage = "Token is missing.")]
        public string Token { get; set; }
        [Required(ErrorMessage = "Email is missing.")]
        public string Email { get; set; }
    }
}
