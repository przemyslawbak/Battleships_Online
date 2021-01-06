﻿using Battleships.Models;
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
                _memoryAccess.RemoveGameFromCacheGameList(game.GameId);
            }
            else
            {
                _memoryAccess.UpdateGame(game, clients);
                await _messenger.SendGameStateToUsersInGame(game, clients);
            }
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
    }
}
