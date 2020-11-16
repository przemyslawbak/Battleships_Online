using Battleships.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;

namespace Battleships.Services
{
    public class MemoryAccess : IMemoryAccess
    {
        private IMemoryCache _cache;

        public MemoryAccess(IMemoryCache memoryCache)
        {
            _cache = memoryCache;
        }

        public Dictionary<string, string> GetUserConnectionIdList()
        {
            if (!_cache.TryGetValue(CacheKeys.ConnectionIdList, out Dictionary<string, string> result))
            {
                result = new Dictionary<string, string>();
                _cache.Set(CacheKeys.ConnectionIdList, result);
            }

            return result;
        }

        public void SetConnectionIdList(Dictionary<string, string> list)
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

        public static class CacheKeys
        {
            public static string GameList { get { return "_GameList"; } }
            public static string ConnectionIdList { get { return "_ConnectionIdList"; } }
        }
    }
}
