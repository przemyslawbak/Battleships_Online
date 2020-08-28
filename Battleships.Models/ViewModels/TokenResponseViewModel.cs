using Newtonsoft.Json;

namespace Battleships.Models.ViewModels
{
    //TODO: verify
    [JsonObject(MemberSerialization.OptOut)]
    public class TokenResponseViewModel
    {
        public string token { get; set; }
        public int expiration { get; set; }
    }
}
