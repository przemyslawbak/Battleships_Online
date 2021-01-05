using Battleships.Models.ViewModels;
using System.Collections.Generic;

namespace Battleships.Services
{
    public class GameService : IGameService
    {
        private readonly IMemoryAccess _memoryAccess;

        public GameService(IMemoryAccess memoryAccess)
        {
            _memoryAccess = memoryAccess;
        }

        public List<GameListedViewModel> RemoveEmptyGames(List<GameListedViewModel> list)
        {
            for (int i = 0; i < list.Count; i++)
            {
                if(IsGameEmpty(list[i]))
                {
                    _memoryAccess.RemoveGameFromMemory(list[i].GameId);
                    list.Remove(list[i]);
                }
            }

            return list;
        }

        private bool IsGameEmpty(GameListedViewModel game)
        {
            if (game.Players[0] == "" && game.Players[1] == "")
            {
                return true;
            }

            if (game.Players[0] == "COMPUTER" && game.Players[1] == "")
            {
                return true;
            }

            if (game.Players[0] == "" && game.Players[1] == "COMPUTER")
            {
                return true;
            }

            return false;
        }
    }
}
