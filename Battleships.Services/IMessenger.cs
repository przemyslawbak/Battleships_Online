using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IMessenger
    {
        Task SendGameStateToUsersInGame(GameStateModel game, IHubCallerClients clients);
        Task SendChatMessageToUsersInGame(string message, string[] playersNames, IHubCallerClients clients, string callersDisplayName);
    }
}