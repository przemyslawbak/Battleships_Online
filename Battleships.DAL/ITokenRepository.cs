using Microsoft.AspNetCore.Http;

namespace Battleships.DAL
{
    public interface ITokenRepository
    {
        void SaveRefreshToken(string refreshToken, string id, string ip);
        bool VerifyReceivedToken(string refreshtoken, string username, string ip);
        void DeleteRefreshToken(string username);
    }
}