using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IMessenger
    {
        Task SendChatMesssage(string name, string message, IHubCallerClients clients, HubCallerContext context);
        Task SendGameStateToUsersInGame(GameStateModel game, IHubCallerClients clients);
    }
}