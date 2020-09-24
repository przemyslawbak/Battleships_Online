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

        /// <summary>
        /// Returns SecurityTokenDescriptor object basing on AppUser properties, user role and identity claims.
        /// </summary>
        /// <param name="user">AppUser object.</param>
        /// <param name="role">String user role.</param>
        /// <returns></returns>
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

        /// <summary>
        /// Extracts authentity token from HttpContext.
        /// </summary>
        /// <returns>String user auth token.</returns>
        public string GetCurrentToken(HttpContext httpContext)
        {
            StringValues authorizationHeader = httpContext.Request.Headers["authorization"];

            return authorizationHeader == StringValues.Empty ? string.Empty : authorizationHeader.Single().Split(' ').Last();
        }

        /// <summary>
        /// Cleaning up list ot blacklisted user auth tokens.
        /// </summary>
        public void CleanUpBlacklistedTokens()
        {
            _tokenRepo.CleanUpBlacklistedTokens(_hoursKeepBlacklistedTokend);
        }

        /// <summary>
        /// Verifies in DB if refresh token is still valid.
        /// </summary>
        /// <param name="refreshToken">Token to be verified.</param>
        /// <param name="email">Email address assigned to AppUser object.</param>
        /// <param name="requstIp">Clients IP address.</param>
        /// <returns>Boolean true if token is valid.</returns>
        public bool VerifyRefreshToken(string refreshToken, string email, string requstIp)
        {
            return _tokenRepo.VerifyReceivedToken(refreshToken, email, requstIp);
        }

        /// <summary>
        /// After logging out, deletes refresh token from DB, cleans up blacklisted wuth tokens, and blacklisting token that was in use.
        /// </summary>
        /// <param name="model">RevokeTokenRequestViewModel oject with listed tokens and AppUser data.</param>
        /// <returns>Boolean if successfully tokens are revoked.</returns>
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

        /// <summary>
        /// Returns TokenResponseViewModel object with AppClients authentity credentials.
        /// </summary>
        /// <param name="user">AppUser object.</param>
        /// <param name="role">String with user role.</param>
        /// <param name="ip">Request IP address.</param>
        /// <returns></returns>
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

        /// <summary>
        /// Generates new refresh token.
        /// </summary>
        /// <returns>New encrypted refresh token.</returns>
        private string GenerateRefreshToken()
        {
            using (RNGCryptoServiceProvider rngCryptoServiceProvider = new RNGCryptoServiceProvider())
            {
                byte[] randomBytes = new byte[64];
                rngCryptoServiceProvider.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        /// <summary>
        /// Checks if token is blacklisted from use.
        /// </summary>
        /// <param name="currentToken">Current user auth token.</param>
        /// <returns>Boolean result.</returns>
        public bool IsTokenBlacklisted(string currentToken)
        {
            return _tokenRepo.IsTokenBlacklisted(currentToken);
        }
    }
}
