using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Hubs
{
    public class MessageHub : Hub
    {
        public async Task SendMessage(FancyModel message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
