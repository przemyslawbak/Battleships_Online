using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class Messenger : IMessenger
    {
        private readonly IMemoryAccess _cache;
        private readonly ISender _sender;

        public Messenger(IMemoryAccess cache, ISender sender)
        {
            _cache = cache;
            _sender = sender;
        }

        public async Task SendGameStateToUsersInGame(GameStateModel game, IHubCallerClients clients)
        {
            if (!game.GameMulti)
            {
                _cache.RemoveGameFromMemory(game.GameId);
            }

            foreach (Player player in game.Players)
            {
                if (IsValidUserName(player.UserName))
                {
                    await _sender.SendGameState(player.UserName, game, clients);
                }
            }
        }

        public async Task SendChatMessageToUsersInGame(string message, string[] playerNames, IHubCallerClients clients)
        {
            foreach (string name in playerNames)
            {
                if (IsValidUserName(name))
                {
                    await _sender.SendChatMesssage(name, message, clients);
                }
            }
        }

        private bool IsValidUserName(string name)
        {
            if (!string.IsNullOrEmpty(name))
            {
                if (name != "COMPUTER")
                {
                    return true;
                }
            }

            return false;
        }
    }
}
