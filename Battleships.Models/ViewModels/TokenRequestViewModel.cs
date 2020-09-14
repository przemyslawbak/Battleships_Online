using Newtonsoft.Json;

namespace Battleships.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class TokenRequestViewModel
    {
        public string GrantType { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
