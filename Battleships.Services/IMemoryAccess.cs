using Battleships.Models;
using System.Collections.Generic;

namespace Battleships.Services
{
    public interface IMemoryAccess
    {
        List<GameStateModel> GetGameList();
        void SetGameList(List<GameStateModel> games);
        Dictionary<string, string> GetUserConnectionIdList();
        void SetConnectionIdList(Dictionary<string, string> ids);
        void RemoveGameFromMemory(int gameId);
    }
}