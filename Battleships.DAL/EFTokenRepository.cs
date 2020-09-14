using Battleships.Models;
using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Linq;

namespace Battleships.DAL
{
    public class EFTokenRepository : ITokenRepository
    {
        private ApplicationDbContext _context;

        public EFTokenRepository(ApplicationDbContext ctx)
        {
            _context = ctx;
        }

        public void AddBlacklistedToken(string token)
        {
            _context.BlacklistedTokens.Add(new BlacklistedToken() { Token = token, BlacklistedDateTime = DateTime.UtcNow });
            _context.SaveChanges();
        }

        public void CleanUpBlacklistedTokens(int hoursKeepBlacklistedTokend)
        {
            var expiredBlacklistedTokens = _context.BlacklistedTokens.Where(tokens => DateTime.UtcNow > tokens.BlacklistedDateTime.AddHours(hoursKeepBlacklistedTokend));
            _context.BlacklistedTokens.RemoveRange(expiredBlacklistedTokens);
            _context.SaveChanges();
        }

        public void DeleteRefreshToken(string email)
        {
            if (_context.RefreshTokens.Any(tokens => tokens.Email == email))
            {
                var allTokens = _context.RefreshTokens.Where(tokens => tokens.Email == email);
                _context.RefreshTokens.RemoveRange(allTokens);
                _context.SaveChanges();
            }
        }

        public void SaveRefreshToken(string refreshToken, string email, string ip)
        {
            bool emailExists = _context.RefreshTokens.Any(tokens => tokens.Email == email);

            if (emailExists)
            {
                _context.RefreshTokens.Remove(_context.RefreshTokens.First(tokens => tokens.Email == email));
            }

            _context.RefreshTokens.Add(new RefreshToken() { IpAddress = ip, Token = refreshToken, Email = email });
            _context.SaveChanges();
        }

        public bool VerifyReceivedToken(string refreshToken, string email, string ip)
        {
            return _context.RefreshTokens.Any(tokens => tokens.Token == refreshToken && tokens.IpAddress == ip && tokens.Email == email);
        }

        public bool VeriFyTokenBan(string currentToken)
        {
            return _context.BlacklistedTokens.Any(token => token.Token == currentToken);
        }
    }
}
