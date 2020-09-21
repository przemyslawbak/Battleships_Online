using Battleships.Models;
using Battleships.Models.ViewModels;

namespace Battleships.Services
{
    public interface ITokenService
    {
        string GetRefreshToken();
        string GetCurrentToken();
        void CleanUpBlacklistedTokens();
        bool VerifyRefreshToken(string refreshToken, string email, string requstIp);
        bool RevokeTokens(RevokeTokenRequestViewModel model);
        TokenResponseViewModel GenerateTokenResponse(AppUser user, string role, string ip);
    }
}