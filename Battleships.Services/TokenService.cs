using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
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
        private readonly IConfiguration _configuration;
        private readonly ITokenRepository _tokenRepo;
        private readonly int _hoursKeepBlacklistedTokend;

        public TokenService(IConfiguration config, ITokenRepository tokenRepo)
        {
            _configuration = config;
            _tokenRepo = tokenRepo;
            _hoursKeepBlacklistedTokend = _configuration.GetValue<int>("Auth:JsonWebToken:BlacklistedTokenInHours");
        }

        public SecurityToken GetSecurityToken(AppUser user, string role)
        {
            int expiration = _configuration.GetValue<int>("Auth:JsonWebToken:TokenExpirationInMinutes");
            string key = _configuration["Auth:JsonWebToken:Key"];

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            byte[] secret = Encoding.ASCII.GetBytes(key);

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, role)
                }),
                Expires = DateTime.UtcNow.AddSeconds(expiration), //todo: addminutes
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secret), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Auth:JsonWebToken:Issuer"],
                Audience = _configuration["Auth:JsonWebToken:Audience"]
            };

            return tokenHandler.CreateToken(tokenDescriptor);
        }

        public string GetCurrentToken(HttpContext httpContext)
        {
            StringValues authorizationHeader = httpContext.Request.Headers["authorization"];

            return authorizationHeader == StringValues.Empty ? string.Empty : authorizationHeader.Single().Split(' ').Last();
        }

        public void CleanUpBlacklistedTokens()
        {
            _tokenRepo.CleanUpBlacklistedTokens(_hoursKeepBlacklistedTokend);
        }

        public bool VerifyRefreshToken(string refreshToken, string email, string requstIp)
        {
            return _tokenRepo.VerifyReceivedToken(refreshToken, email, requstIp);
        }

        public bool RevokeTokens(RevokeTokenRequestViewModel model)
        {
            try
            {
                _tokenRepo.DeleteRefreshToken(model.UserName);
                CleanUpBlacklistedTokens();
                _tokenRepo.AddBlacklistedToken(model.Token);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public TokenResponseViewModel GenerateTokenResponse(AppUser user, string role, string ip)
        {
            SecurityToken token = GetSecurityToken(user, role);

            string encodedToken = new JwtSecurityTokenHandler().WriteToken(token);
            string refreshToken = GenerateRefreshToken();

            _tokenRepo.SaveRefreshToken(refreshToken, user.Email, ip);

            return new TokenResponseViewModel()
            {
                Token = encodedToken.Replace("/", "$").Replace("=", "@"),
                Email = user.Email,
                User = user.UserName,
                RefreshToken = refreshToken.Replace("/", "$").Replace("=", "@"),
                DisplayName = user.DisplayName,
                Role = role
            };
        }

        public bool IsTokenBlacklisted(string currentToken)
        {
            return _tokenRepo.IsTokenBlacklisted(currentToken);
        }

        private string GenerateRefreshToken()
        {
            using (RNGCryptoServiceProvider rngCryptoServiceProvider = new RNGCryptoServiceProvider())
            {
                byte[] randomBytes = new byte[64];
                rngCryptoServiceProvider.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }
    }
}
