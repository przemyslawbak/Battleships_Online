using Battleships.Models;
using Battleships.Models.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IGameService
    {
        List<GameListedViewModel> RemoveEmptyGames(List<GameListedViewModel> list);
        void UpdateExistingGame(GameStateModel game);
        void RemoveGameFromCacheGameList(int gameId);
        List<GameStateModel> GetPlayersGames(string userName);
        Task RemoveGameIfEmpty(GameStateModel game, Microsoft.AspNetCore.SignalR.IHubCallerClients clients);
    }
}