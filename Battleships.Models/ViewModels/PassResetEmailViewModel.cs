using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    public class PassResetEmailViewModel
    {
        [Required(ErrorMessage = "Please fill up your email address.")]
        [EmailAddress(ErrorMessage = "The email field is not a valid e-mail address.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Captcha verification error.")]
        public string CaptchaToken { get; set; }
    }
}
