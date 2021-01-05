using Battleships.Models;
using Battleships.Models.ViewModels;
using System.Collections.Generic;
using System.Linq;

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

        public void UpdateExistingGame(GameStateModel game)
        {
            List<GameStateModel> games = _memoryAccess.GetGameList();
            GameStateModel thisGame = games.Where(g => g.GameId == game.GameId).FirstOrDefault();
            if (thisGame != null)
            {
                games.Remove(thisGame);
            }
            games.Add(game);
            _memoryAccess.SetGameList(games);
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

        public void RemoveGameFromCacheGameList(int gameId)
        {
            List<GameStateModel> games = _memoryAccess.GetGameList();
            GameStateModel game = _memoryAccess.GetGameList().Where(g => g.GameId == gameId).FirstOrDefault();
            if (game != null)
            {
                games.Remove(game);
                _memoryAccess.SetGameList(games);
            }
        }
    }
}
}
