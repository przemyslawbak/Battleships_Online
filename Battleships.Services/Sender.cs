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

        public async Task SendChatMesssage(string name, string message, IHubCallerClients clients, string callersUserName)
        {
            string id = GetConnectionId(name);
            ChatMessageViewModel model = await GenerateChatMessage(message, name, callersUserName);
            await clients.Client(id).SendAsync("ReceiveChatMessage", model);
        }

        private string GetConnectionId(string name)
        {
            Dictionary<string, object> ids = _cache.GetUserConnectionIdList();
            return ids[name].ToString();
        }

        private async Task<ChatMessageViewModel> GenerateChatMessage(string message, string name, string callersUserName)
        {
            string callersDisplayName = await _userService.GetDisplayNameByUserName(callersUserName);
            return new ChatMessageViewModel()
            {
                DisplayName = callersDisplayName,
                Message = message,
                UserName = callersUserName,
                Time = DateTime.UtcNow.ToLongTimeString()
            };
        }
    }
}
