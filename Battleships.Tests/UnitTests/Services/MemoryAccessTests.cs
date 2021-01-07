using Battleships.Models;
using Battleships.Services;
using Battleships.Tests.Wrappers;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class MemoryAccessTests
    {
        private MemoryAccess _service;
        private readonly Dictionary<string, object> _dictionary;
        private IMemoryCache _memoryCache;

        public MemoryAccessTests()
        {
            Dictionary<string, string> sampleConnections = new Dictionary<string, string>() { ["1"] = "someValue1", ["2"] = "someValue2" };
            List<GameStateModel> sampleGames = new List<GameStateModel>() { new GameStateModel() { GameId = 1 }, new GameStateModel() { GameId = 2 } };
            _dictionary = new Dictionary<string, object>() { [CacheKeys.ConnectionIdList] = sampleConnections, [CacheKeys.GameList] = sampleGames };

        }

        [Fact]
        private void GetUserConnectionIdList_OnTryGetValueFailed_ReturnsNewDictionary()
        {
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_dictionary, false);
            Dictionary<string, object> expected = new Dictionary<string, object>();
            _service = new MemoryAccess(_memoryCache);

            var result = _service.GetUserConnectionIdList();

            Assert.Equal(expected, result);
        }

        [Fact]
        private void GetUserConnectionIdList_OnTryGetValueSuccess_ReturnsDictionary()
        {
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_dictionary, true);
            _service = new MemoryAccess(_memoryCache);

            var result = _service.GetUserConnectionIdList();

            Assert.Equal(_dictionary, result);
        }

        //GetUserConnectionIdList
        //todo:

        //GetGameList
        //todo:

        //UpdateGame
        //todo:
    }
}
