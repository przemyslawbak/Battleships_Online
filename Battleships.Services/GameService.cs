using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class GameService : IGameService
    {
        private readonly IMemoryAccess _memoryAccess;
        private readonly IMessenger _messenger;

        public GameService(IMemoryAccess memoryAccess, IMessenger messenger)
        {
            _memoryAccess = memoryAccess;
            _messenger = messenger;
        }

        public List<GameListedViewModel> RemoveEmptyGames(List<GameListedViewModel> list)
        {
            for (int i = 0; i < list.Count; i++)
            {
                string[] playerNames = new string[] { list[i].Players[0], list[i].Players[1] };

                if (IsGameEmpty(playerNames))
                {
                    _memoryAccess.RemoveGameFromMemory(list[i].GameId);
                    list.Remove(list[i]);
                }
            }

            return list;
        }

        public List<GameStateModel> GetPlayersGames(string userName)
        {
            List<GameStateModel> list = _memoryAccess.GetGameList();
            return _memoryAccess.GetGameList().Where(g => g.Players.Any(p => p.UserName == userName)).ToList();
        }

        public List<GameStateModel> RemovePlayerFromGames(List<GameStateModel> playersGames, string userName)
        {
            foreach (GameStateModel game in playersGames)
            {
                foreach (var player in game.Players)
                {
                    if (player.UserName == userName)
                    {
                        player.UserName = string.Empty;
                        player.DisplayName = string.Empty;
                    }
                }
            }

            return playersGames;
        }

        public async Task RemoveGameIfEmpty(GameStateModel game, IHubCallerClients clients)
        {
            string[] playerNames = new string[] { game.Players[0].UserName, game.Players[1].UserName };

            if (IsGameEmpty(playerNames))
            {
                RemoveGameFromCacheGameList(game.GameId);
            }
            else
            {
                await UpdateGame(game, clients);
            }
        }

        public async Task UpdateGame(GameStateModel game, IHubCallerClients clients)
        {
            game = UpdateDeploymentAndStartAllowed(game);
            UpdateExistingGame(game);
            await _messenger.SendGameStateToUsersInGame(game, clients);
        }

        public GameStateModel UpdateDeploymentAndStartAllowed(GameStateModel game)
        {
            game.IsDeploymentAllowed = IsDeploymentAllowed(game.Players);
            game.IsStartAllowed = IsStartAllowed(game.IsDeploymentAllowed, game.Players);

            return game;
        }

        private bool IsGameEmpty(string[] playerNames)
        {
            if (playerNames[0] == "" && playerNames[1] == "")
            {
                return true;
            }

            if (playerNames[0] == "COMPUTER" && string.IsNullOrEmpty(playerNames[1]))
            {
                return true;
            }

            if (string.IsNullOrEmpty(playerNames[0]) && playerNames[1] == "COMPUTER")
            {
                return true;
            }

            return false;
        }

        private bool IsStartAllowed(bool isDeploymentAllowed, Player[] players)
        {
            if (isDeploymentAllowed && players[0].IsDeployed && players[1].IsDeployed)
            {
                return true;
            }

            return false;
        }

        private bool IsDeploymentAllowed(Player[] players)
        {
            if (string.IsNullOrEmpty(players[0].UserName) || string.IsNullOrEmpty(players[1].UserName))
            {
                return false;
            }

            return true;
        }

        private void RemoveGameFromCacheGameList(int gameId)
        {
            List<GameStateModel> games = _memoryAccess.GetGameList();
            GameStateModel game = _memoryAccess.GetGameList().Where(g => g.GameId == gameId).FirstOrDefault();
            if (game != null)
            {
                games.Remove(game);
                _memoryAccess.SetGameList(games);
            }
        }

        private void UpdateExistingGame(GameStateModel game)
        {
            List<GameStateModel> games = _memoryAccess.GetGameList();
            GameStateModel thisGame = games.Where(g => g.GameId == game.GameId).FirstOrDefault();
            if (thisGame != null)
            {
                games.Remove(thisGame);
            }
            games.Add(game);
            _memoryAccess.SetGameList(games);
        }
    }
}
