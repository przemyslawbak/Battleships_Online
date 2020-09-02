using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    public class ResetPasswordViewModel
    {
        [Required(ErrorMessage = "Please fill up your new password.")]
        public string NewPassword { get; set; }
        [Required]
        public string Token { get; set; }
        [Required]
        public string Email { get; set; }
    }
}
