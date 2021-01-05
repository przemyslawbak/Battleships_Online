using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
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
                await _sender.SendGameState(player.UserName, game, clients);
            }
        }

        public async Task SendChatMessageToUsersInGame(string message, string[] playerNames, IHubCallerClients clients)
        {
            foreach (string name in playerNames)
            {
                await _sender.SendChatMesssage(name, message, clients);
            }
        }
    }
}
