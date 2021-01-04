using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class TokenRequestViewModel
    {
        [Required(ErrorMessage = "Please fill up your email address.")]
        [EmailAddress(ErrorMessage = "Please write a valid e-mail address.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Please fill up your password.")]
        public string Password { get; set; }
    }
}
