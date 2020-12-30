using Battleships.Models.ViewModels;
using System.Collections.Generic;

namespace Battleships.Services
{
    public interface IGameService
    {
        List<GameListedViewModel> RemoveEmptyGames(List<GameListedViewModel> list);
    }
}