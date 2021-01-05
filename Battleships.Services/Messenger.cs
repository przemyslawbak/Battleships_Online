using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class Messenger : IMessenger
    {
        private readonly IUserService _userService;
        private readonly IMemoryAccess _cache;

        public Messenger(IUserService userService, IMemoryAccess cache)
        {
            _userService = userService;
            _cache = cache;
        }

        private async Task SendChatMesssage(string name, string message, IHubCallerClients clients, HubCallerContext context)
        {
            if (!string.IsNullOrEmpty(name))
            {
                if (name != "COMPUTER")
                {
                    string id = GetConnectionId(name);
                    await clients.Client(id).SendAsync("ReceiveChatMessage", GenerateChatMessageAsync(message, context));
                }
            }
        }

        private async Task<ChatMessageViewModel> GenerateChatMessageAsync(string message, HubCallerContext context)
        {
            string displayName = await GetUserDisplayById(context.User.Identity.Name);
            string userName = await GetUserName(context.User.Identity.Name);


            return new ChatMessageViewModel()
            {
                DisplayName = displayName,
                Message = message,
                UserName = userName,
                Time = DateTime.UtcNow.ToLongTimeString()
            };
        }

        private string GetConnectionId(string name)
        {
            Dictionary<string, string> ids = _cache.GetUserConnectionIdList();
            return ids[name];
        }

        private async Task<string> GetUserName(string id)
        {
            return await _userService.GetUserNameById(id);
        }

        private async Task<string> GetUserDisplayById(string id)
        {
            return await _userService.GetUserDisplayById(id);
        }

        public async Task SendGameStateToUsersInGame(GameStateModel game, IHubCallerClients clients)
        {
            if (!game.GameMulti)
            {
                _cache.RemoveGameFromMemory(game.GameId);
            }

            if (string.IsNullOrEmpty(game.Players[0].UserName) || string.IsNullOrEmpty(game.Players[1].UserName))
            {
                game.IsDeploymentAllowed = false;
            }
            else
            {
                game.IsDeploymentAllowed = true;
            }

            if (game.IsDeploymentAllowed && game.Players[0].IsDeployed && game.Players[1].IsDeployed)
            {
                game.IsStartAllowed = true;
            }
            else
            {
                game.IsStartAllowed = false;
            }

            foreach (Player player in game.Players)
            {
                if (!string.IsNullOrEmpty(player.UserName))
                {
                    if (player.UserName != "COMPUTER")
                    {
                        string id = GetConnectionId(player.UserName);
                        await clients.Client(id).SendAsync("ReceiveGameState", game);
                    }

                }
            }
        }

        public async Task SendChatMessageToUsersInGame(string message, string[] playersNames, IHubCallerClients clients, HubCallerContext context)
        {
            foreach (string name in playersNames)
            {
                await SendChatMesssage(name, message, clients, context);
            }
        }
    }
}
