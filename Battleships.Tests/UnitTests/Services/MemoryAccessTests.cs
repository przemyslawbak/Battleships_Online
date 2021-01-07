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
        private List<GameStateModel> _list;
        private IMemoryCache _memoryCache;

        public MemoryAccessTests()
        {
            Dictionary<string, string> sampleConnections = new Dictionary<string, string>() { ["1"] = "someValue1", ["2"] = "someValue2" };
            List<GameStateModel> sampleGames = new List<GameStateModel>() { new GameStateModel() { GameId = 1 }, new GameStateModel() { GameId = 2 } };
            _dictionary = new Dictionary<string, object>() { [CacheKeys.ConnectionIdList] = sampleConnections, [CacheKeys.GameList] = sampleGames };

        }

        //GetUserConnectionIdList

        [Fact]
        private void GetUserConnectionIdList_OnTryGetValueFailed_ReturnsNewDictionary()
        {
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_dictionary, false);
            Dictionary<string, object> expected = new Dictionary<string, object>();
            _service = new MemoryAccess(_memoryCache);

            Dictionary<string, object> result = _service.GetUserConnectionIdList();

            Assert.Equal(expected, result);
        }

        [Fact]
        private void GetUserConnectionIdList_OnTryGetValueSuccess_ReturnsDictionary()
        {
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_dictionary, true);
            _service = new MemoryAccess(_memoryCache);

            Dictionary<string, object> result = _service.GetUserConnectionIdList();

            Assert.Equal(_dictionary, result);
        }

        //GetGameList

        [Fact]
        private void GetGameList_OnTryGetValueFailed_ReturnsNewDictionary()
        {
            _list = new List<GameStateModel> { new GameStateModel(), new GameStateModel() };
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_list, false);
            List<GameStateModel> expected = new List<GameStateModel>();
            _service = new MemoryAccess(_memoryCache);

            List<GameStateModel> result = _service.GetGameList();

            Assert.Equal(expected, result);
        }

        [Fact]
        private void GetGameList_OnTryGetValueSuccess_ReturnsDictionary()
        {
            _list = new List<GameStateModel> { new GameStateModel(), new GameStateModel() };
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_list, true);
            _service = new MemoryAccess(_memoryCache);

            List<GameStateModel> result = _service.GetGameList();

            Assert.Equal(_list, result);
        }

        [Fact]
        private void UpdateGame_OnDifferentGameIds_AddsOneGameToTheListAndReturnsGame()
        {
            _list = new List<GameStateModel> { new GameStateModel() { GameId = 3 }, new GameStateModel() { GameId = 4 } };
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_list, true);
            _service = new MemoryAccess(_memoryCache);
            GameStateModel game = new GameStateModel() 
            { 
                GameId = 1, 
                IsDeploymentAllowed = false, 
                IsStartAllowed = false, 
                Players = new Player[] 
                { 
                    new Player() 
                    { 
                        UserName = "some1"
                    }, 
                    new Player() 
                    { 
                        UserName = "some2" 
                    } 
                } 
            };

            GameStateModel result = _service.UpdateGame(game);

            Assert.NotNull(result);
            Assert.Equal(3, _list.Count);
        }

        [Fact]
        private void UpdateGame_OnSameGameId_AddsOneGameToTheListAndRemovesOneAndReturnsGame()
        {
            _list = new List<GameStateModel> { new GameStateModel() { GameId = 1 }, new GameStateModel() { GameId = 2 } };
            _memoryCache = MemoryCacheWrapper.GetMemoryCache(_list, true);
            _service = new MemoryAccess(_memoryCache);
            GameStateModel game = new GameStateModel()
            {
                GameId = 1,
                IsDeploymentAllowed = false,
                IsStartAllowed = false,
                Players = new Player[]
                {
                    new Player()
                    {
                        UserName = "some1"
                    },
                    new Player()
                    {
                        UserName = "some2"
                    }
                }
            };

            GameStateModel result = _service.UpdateGame(game);

            Assert.NotNull(result);
            Assert.Equal(2, _list.Count);
        }

        //UpdateGame
        //todo:
    }
}
