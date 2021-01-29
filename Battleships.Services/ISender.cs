using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface ISender
    {
        Task SendGameState(string userName, GameStateModel game, IHubCallerClients clients);
        Task SendChatMesssage(string name, string message, IHubCallerClients clients, string connectionId);
    }
}