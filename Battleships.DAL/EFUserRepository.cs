using Battleships.Models.ViewModels;
using System.Collections.Generic;
using System.Linq;

namespace Battleships.DAL
{
    public class EFUserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        public EFUserRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public List<BestPlayersViewModel> GetTop10Players()
        {
            return (from user in _context.Users
                    .OrderByDescending(user => user.WonAiGames)
                    select new BestPlayersViewModel()
                    {
                        DisplayName = user.DisplayName,
                        WonAiGames = user.WonAiGames,
                        WonMultiplayerGames = user.WonMultiplayerGames
                    }).Take(10).ToList();
        }
    }
}
