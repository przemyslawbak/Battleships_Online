﻿using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace Battleships.Models.ViewModels
{
    //TODO: verify
    [JsonObject(MemberSerialization.OptOut)]
    public class TokenResponseViewModel
    {
        public string Token { get; set; }
        public string Email { get; set; }
        public string User { get; set; }
        public int Expiration { get; set; }
    }
}
