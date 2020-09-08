using Battleships.Models;
using Microsoft.IdentityModel.Tokens;

namespace Battleships.Services
{
    public interface ITokenService
    {
        SecurityToken GetSecurityToken(AppUser user, string key, int expiration);
    }
}