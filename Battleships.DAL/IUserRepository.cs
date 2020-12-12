using Battleships.Models;
using Battleships.Models.ViewModels;
using System.Collections.Generic;

namespace Battleships.DAL
{
    public interface IUserRepository
    {
        List<BestPlayersViewModel> GetTop10Players();
        bool AddWonGame(GameWinner model);
    }
}