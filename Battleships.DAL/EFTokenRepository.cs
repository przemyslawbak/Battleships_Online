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

        public void DeleteRefreshToken(string userName)
        {
            if (_context.RefreshTokens.Any(tokens => tokens.UserName == userName))
            {
                var allTokens = _context.RefreshTokens.Where(tokens => tokens.UserName == userName);
                _context.RefreshTokens.RemoveRange(allTokens);
                _context.SaveChanges();
            }
        }

        public void SaveRefreshToken(string refreshToken, string userName, string ip)
        {
            bool userExists = _context.RefreshTokens.Any(tokens => tokens.UserName == userName);

            if (userExists)
            {
                _context.RefreshTokens.Remove(_context.RefreshTokens.First(tokens => tokens.UserName == userName));
            }

            _context.RefreshTokens.Add(new RefreshToken() { IpAddress = ip, Token = refreshToken, UserName = userName });
            _context.SaveChanges();
        }

        public bool VerifyReceivedToken(string refreshToken, string userName, string ip)
        {
            return _context.RefreshTokens.Any(tokens => tokens.UserName == userName && tokens.IpAddress == ip && tokens.UserName == userName);
        }

        public bool VeriFyTokenBan(string currentToken)
        {
            return _context.BlacklistedTokens.Any(token => token.Token == currentToken);
        }
    }
}
