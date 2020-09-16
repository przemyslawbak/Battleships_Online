using Battleships.DAL;
using Battleships.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Battleships.Services
{
    public class TokenService : ITokenService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        private readonly ITokenRepository _tokenRepo;
        private readonly int _hoursKeepBlacklistedTokend;

        public TokenService(IHttpContextAccessor httpContextAccessor, IConfiguration config, ITokenRepository tokenRepo)
        {
            _httpContextAccessor = httpContextAccessor;
            _configuration = config;
            _tokenRepo = tokenRepo;
            _hoursKeepBlacklistedTokend = _configuration.GetValue<int>("Auth:JsonWebToken:BlacklistedTokenInHours");
        }

        public string GetRefreshToken()
        {
            using (var rngCryptoServiceProvider = new RNGCryptoServiceProvider())
            {
                byte[] randomBytes = new byte[64];
                rngCryptoServiceProvider.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        public SecurityToken GetSecurityToken(AppUser user)
        {
            int expiration = _configuration.GetValue<int>("Auth:JsonWebToken:TokenExpirationInMinutes");
            string key = _configuration["Auth:JsonWebToken:Key"];

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            byte[] secret = Encoding.ASCII.GetBytes(key);

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(expiration),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secret), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Auth:JsonWebToken:Issuer"],
                Audience = _configuration["Auth:JsonWebToken:Audience"]
            };

            return tokenHandler.CreateToken(tokenDescriptor);
        }

        public string GetCurrentToken()
        {
            var authorizationHeader = _httpContextAccessor.HttpContext.Request.Headers["authorization"];

            return authorizationHeader == StringValues.Empty ? string.Empty : authorizationHeader.Single().Split(' ').Last();
        }

        public void CleanUpBlacklistedTokens()
        {
            _tokenRepo.CleanUpBlacklistedTokens(_hoursKeepBlacklistedTokend);
        }
    }
}
