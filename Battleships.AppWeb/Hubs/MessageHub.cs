using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Hubs
{
    [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
    public class MessageHub : Hub
    {
        private readonly IUserService _userService;
        public MessageHub(IUserService userService)
        {
            _userService = userService;
        }
        public async Task SendMessage(FancyModel message)
        {
            message.SomeName = await GetUserName(Context.User.Identity.Name);

            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public override async Task OnConnectedAsync()
        {
            FancyModel message = new FancyModel()
            {
                SomeName = "Server",
                SomeMessage = "User " + await GetUserName(Context.User.Identity.Name) + " connected",
                SomeNumber = 96
            };

            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            FancyModel message = new FancyModel()
            {
                SomeName = "Server",
                SomeMessage = "User " + await GetUserName(Context.User.Identity.Name) + " disconnected",
                SomeNumber = 96
            };

            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        private async Task<string> GetUserName(string id)
        {
            return await _userService.GetUserNameById(id);
        }
    }
}
