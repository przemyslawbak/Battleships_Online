using Battleships.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IMemoryAccess
    {
        List<GameStateModel> GetGameList();
        void SetGameList(List<GameStateModel> games);
        Dictionary<string, object> GetUserConnectionIdList();
        void SetConnectionIdList(Dictionary<string, object> ids);
        void RemoveGameFromMemory(int gameId);
        GameStateModel GetGameById(int id);
        GameStateModel UpdateGame(GameStateModel game);
    }
}