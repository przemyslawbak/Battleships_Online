namespace Battleships.DAL
{
    public interface ITokenRepository
    {
        void SaveRefreshToken(string refreshToken, string email, string ip);
        bool VerifyReceivedToken(string refreshtoken, string email, string ip);
        void DeleteRefreshToken(string email);
        void AddBlacklistedToken(string token);
        bool IsTokenBlacklisted(string currentToken);
        void CleanUpBlacklistedTokens(int hoursKeepBlacklistedTokend);
    }
}