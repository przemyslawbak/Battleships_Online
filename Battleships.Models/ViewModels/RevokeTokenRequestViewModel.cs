using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    public class RevokeTokenRequestViewModel
    {
        [Required(ErrorMessage = "Please fill up user name.")]
        public string UserName { get; set; }
        [Required(ErrorMessage = "Token is missing.")]
        public string RefreshToken { get; set; }
        [Required(ErrorMessage = "Token is missing.")]
        public string Token { get; set; }
    }
}
