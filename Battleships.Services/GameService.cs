using Battleships.Models.ViewModels;
using System;
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
            foreach (GameListedViewModel game in list)
            {
                if(isGameEmpty(game))
                {
                    list.Remove(game);
                    _memoryAccess.RemoveGameFromMemory(game.GameId);
                }
            }

            return list;
        }

        private bool isGameEmpty(GameListedViewModel game)
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
