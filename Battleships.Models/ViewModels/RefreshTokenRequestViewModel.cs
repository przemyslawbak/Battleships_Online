using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    public class RefreshTokenRequestViewModel
    {
        [Required(ErrorMessage = "Please fill up your email address.")]
        [EmailAddress(ErrorMessage = "Please write a valid e-mail address.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Token is missing.")]
        public string RefreshToken { get; set; }
    }
}
