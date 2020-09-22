using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class TokenRequestViewModel
    {
        public string GrantType { get; set; }
        public string ClientId { get; set; }
        [Required(ErrorMessage = "Some authentication data is missing.")]
        public string ClientSecret { get; set; }
        [Required(ErrorMessage = "Please fill up your email address.")]
        [EmailAddress(ErrorMessage = "Please write a valid e-mail address.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Please fill up your password.")]
        public string Password { get; set; }
    }
}
