using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IGameService
    {
        List<GameListedViewModel> RemoveEmptyGames(List<GameListedViewModel> list);
        List<GameStateModel> GetPlayersGames(string userName);
        Task RemoveGameIfEmpty(GameStateModel game, Microsoft.AspNetCore.SignalR.IHubCallerClients clients);
        List<GameStateModel> RemovePlayerFromGames(List<GameStateModel> playersGames, string userName);
        GameStateModel UpdateDeploymentAndStartAllowed(GameStateModel game);
        Task UpdateGame(GameStateModel game, IHubCallerClients clients);
    }
}