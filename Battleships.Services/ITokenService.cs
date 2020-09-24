using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Http;

namespace Battleships.Services
{
    public interface ITokenService
    {
        string GetCurrentToken(HttpContext httpContext);
        void CleanUpBlacklistedTokens();
        bool VerifyRefreshToken(string refreshToken, string email, string requstIp);
        bool RevokeTokens(RevokeTokenRequestViewModel model);
        TokenResponseViewModel GenerateTokenResponse(AppUser user, string role, string ip);
        bool IsTokenBlacklisted(string currentToken);
    }
}