using Microsoft.AspNetCore.Http;

namespace Battleships.DAL
{
    public interface ITokenRepository
    {
        void SaveRefreshToken(string refreshToken, string email, string ip);
        bool VerifyReceivedToken(string refreshtoken, string email, string ip);
        void DeleteRefreshToken(string email);
        void AddBlacklistedToken(string token);
        bool VeriFyTokenBan(string currentToken);
        void CleanUpBlacklistedTokens(int hoursKeepBlacklistedTokend);
    }
}