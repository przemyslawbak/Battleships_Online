using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class Sender : ISender
    {
        private readonly IMemoryAccess _cache;
        private readonly IUserService _userService;

        public Sender(IMemoryAccess cache, IUserService userService)
        {
            _cache = cache;
            _userService = userService;
        }

        public async Task SendGameState(string name, GameStateModel game, IHubCallerClients clients)
        {
            string id = GetConnectionId(name);
            await clients.Client(id).SendAsync("ReceiveGameState", game);
        }

        public async Task SendChatMesssage(string name, string message, IHubCallerClients clients)
        {
            string id = GetConnectionId(name);
            ChatMessageViewModel model = await GenerateChatMessageAsync(message, name);
            await clients.Client(id).SendAsync("ReceiveChatMessage", model);
        }

        private string GetConnectionId(string name)
        {
            Dictionary<string, object> ids = _cache.GetUserConnectionIdList();
            return ids[name].ToString();
        }

        private async Task<ChatMessageViewModel> GenerateChatMessageAsync(string message, string name)
        {
            string displayName = await _userService.GetUserDisplayByName(name);

            return new ChatMessageViewModel()
            {
                DisplayName = displayName,
                Message = message,
                UserName = name,
                Time = DateTime.UtcNow.ToLongTimeString()
            };
        }
    }
}
