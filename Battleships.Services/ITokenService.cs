using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.IdentityModel.Tokens;

namespace Battleships.Services
{
    public interface ITokenService
    {
        string GetRefreshToken();
        string GetCurrentToken();
        void CleanUpBlacklistedTokens();
        TokenResponseViewModel GenerateResponse(AppUser user, string ip, string role);
    }
}