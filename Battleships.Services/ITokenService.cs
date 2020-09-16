using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.IdentityModel.Tokens;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface ITokenService
    {
        SecurityToken GetSecurityToken(AppUser user);
        string GetRefreshToken();
        string GetCurrentToken();
        void CleanUpBlacklistedTokens();
        TokenResponseViewModel GenerateResponse(AppUser user, string ip);
    }
}