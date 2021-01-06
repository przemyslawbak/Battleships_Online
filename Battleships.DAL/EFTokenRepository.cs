using Battleships.Models;
using Microsoft.EntityFrameworkCore.Internal;
using System;
using System.Linq;

namespace Battleships.DAL
{
    public class EFTokenRepository : ITokenRepository
    {
        private readonly ApplicationDbContext _context;

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
            IQueryable<BlacklistedToken> expiredBlacklistedTokens = _context.BlacklistedTokens.Where(tokens => DateTime.UtcNow > tokens.BlacklistedDateTime.AddHours(hoursKeepBlacklistedTokend));
            _context.BlacklistedTokens.RemoveRange(expiredBlacklistedTokens);
            _context.SaveChanges();
        }

        public void DeleteRefreshToken(string email)
        {
            if (_context.RefreshTokens.Any(tokens => tokens.Email == email))
            {
                IQueryable<RefreshToken> allTokens = _context.RefreshTokens.Where(tokens => tokens.Email == email);
                _context.RefreshTokens.RemoveRange(allTokens);
                _context.SaveChanges();
            }
        }

        public void SaveRefreshToken(string refreshToken, string email, string ip)
        {
            ip = CheckIp(ip);

            _context.RefreshTokens.Add(new RefreshToken() { IpAddress = ip, Token = refreshToken, Email = email });
            _context.SaveChanges();
        }

        public bool VerifyReceivedToken(string refreshToken, string email, string ip)
        {
            ip = CheckIp(ip);

            return _context.RefreshTokens.Any(tokens => tokens.Token == refreshToken && tokens.IpAddress == ip && tokens.Email == email);
        }

        public bool IsTokenBlacklisted(string currentToken)
        {
            return _context.BlacklistedTokens.Any(token => token.Token == currentToken);
        }

        public void RemoveToken(string email)
        {
            if (IsTokenSaved(email))
            {
                _context.RefreshTokens.Remove(_context.RefreshTokens.First(tokens => tokens.Email == email));
            }
        }

        public bool IsTokenSaved(string email)
        {
            return _context.RefreshTokens.Any(tokens => tokens.Email == email);
        }

        private string CheckIp(string ip)
        {
            if (ip == "0.0.0.1") ip = "127.0.0.1";

            return ip;
        }
    }
}
