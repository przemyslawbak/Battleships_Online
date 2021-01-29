using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class Messenger : IMessenger
    {
        private readonly IUserNameValidator _nameValidator;
        private readonly IMemoryAccess _cache;
        private readonly ISender _sender;

        public Messenger(IMemoryAccess cache, ISender sender, IUserNameValidator nameValidator)
        {
            _cache = cache;
            _sender = sender;
            _nameValidator = nameValidator;
        }

        public async Task SendGameStateToUsersInGame(GameStateModel game, IHubCallerClients clients)
        {
            if (!game.GameMulti)
            {
                _cache.RemoveGameFromMemory(game.GameId);
            }

            foreach (Player player in game.Players)
            {
                if (_nameValidator.IsValidUserName(player.UserName))
                {
                    await _sender.SendGameState(player.UserName, game, clients);
                }
            }
        }

        public async Task SendChatMessageToUsersInGame(string message, string[] playerNames, IHubCallerClients clients, string callersUserName)
        {
            foreach (string name in playerNames)
            {
                if (_nameValidator.IsValidUserName(name))
                {
                    await _sender.SendChatMesssage(name, message, clients, callersUserName);
                }
            }
        }
    }
}
