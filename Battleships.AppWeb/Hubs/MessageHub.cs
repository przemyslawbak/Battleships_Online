using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
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
            string id = Context.User.Identity.Name;
            string userName = await _userService.GetUserNameById(id);
            message.SomeName = userName;

            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
