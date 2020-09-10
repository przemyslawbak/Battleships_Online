using Battleships.Models;
using Microsoft.EntityFrameworkCore.Internal;
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
    }
}
