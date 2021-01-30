using Battleships.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;
using System.Linq;

namespace Battleships.Services
{
    public static class CacheKeys
    {
        public static string GameList { get { return "_GameList"; } }
        public static string ConnectionIdList { get { return "_ConnectionIdList"; } }
    }

    public class MemoryAccess : IMemoryAccess
    {
        private IMemoryCache _cache;

        public MemoryAccess(IMemoryCache memoryCache)
        {
            _cache = memoryCache;
        }

        public Dictionary<string, object> GetUserConnectionIdList()
        {
            if (!_cache.TryGetValue(CacheKeys.ConnectionIdList, out Dictionary<string, object> result))
            {
                result = new Dictionary<string, object>();
                _cache.Set(CacheKeys.ConnectionIdList, result);
            }

            return result;
        }

        public void SetConnectionIdList(Dictionary<string, object> list)
        {
            _cache.Set(CacheKeys.ConnectionIdList, list);
        }

        public List<GameStateModel> GetGameList()
        {
            if (!_cache.TryGetValue(CacheKeys.GameList, out List<GameStateModel> result))
            {
                result = new List<GameStateModel>();
                _cache.Set(CacheKeys.GameList, result);
            }

            return result;
        }

        public void SetGameList(List<GameStateModel> list)
        {
            _cache.Set(CacheKeys.GameList, list);
        }

        public void RemoveGameFromMemory(int gameId)
        {
            List<GameStateModel> games = GetGameList();
            games.RemoveAll(game => game.GameId == gameId);
            SetGameList(games);
        }

        public GameStateModel GetGameById(int id)
        {
            return GetGameList().Where(g => g.GameId == id).FirstOrDefault();
        }

        public GameStateModel UpdateGame(GameStateModel game)
        {
            game = UpdateDeploymentAndStartAllowed(game);
            //todo: remove empty games?

            return game;
        }

        private GameStateModel UpdateDeploymentAndStartAllowed(GameStateModel game)
        {
            game.IsDeploymentAllowed = IsDeploymentAllowed(game.Players);
            game.IsStartAllowed = IsStartAllowed(game.Players);

            return game;
        }

        //todo: check tests
        private bool IsStartAllowed(Player[] players)
        {
            if (players[0].IsDeployed && players[1].IsDeployed)
            {
                return true;
            }

            return false;
        }

        private bool IsDeploymentAllowed(Player[] players)
        {
            if (string.IsNullOrEmpty(players[0].UserName) || string.IsNullOrEmpty(players[1].UserName))
            {
                return false;
            }

            return true;
        }
    }
}
