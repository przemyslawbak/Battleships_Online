using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Moq;
using System.Collections.Generic;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class GameServiceTests
    {
        private readonly Mock<IMemoryAccess> _cacheMock;
        private readonly Mock<IMessenger> _messengerMock;
        private readonly GameService _service;

        public GameServiceTests()
        {
            _cacheMock = new Mock<IMemoryAccess>();
            _messengerMock = new Mock<IMessenger>();

            _service = new GameService(_cacheMock.Object, _messengerMock.Object);
        }

        //RemoveEmptyGames

        [Theory]
        [InlineData("", "", 0)]
        [InlineData("", "UserName", 1)]
        [InlineData("UserName", "", 1)]
        [InlineData("COMPUTER", "", 0)]
        [InlineData("", "COMPUTER", 0)]
        [InlineData("UserName", "COMPUTER", 1)]
        [InlineData("COMPUTER", "UserName", 1)]
        private void RemoveEmptyGames_OnUserNameValues_ReturnsListItems(string user0Name, string user1Name, int expected)
        {
            GameListedViewModel game = new GameListedViewModel() { Players = new string[] { user0Name, user1Name } };
            List<GameListedViewModel> games = new List<GameListedViewModel>();
            games.Add(game);

            List<GameListedViewModel> result = _service.RemoveEmptyGames(games);

            Assert.Equal(expected, result.Count);
        }

        //RemovePlayerFromGames

        [Fact]
        private void RemovePlayerFromGames_OnPlayerInGame_RemovesPlayerNames()
        {
            string userName = "player_one_userName";
            string displayName = "player_one_displayName";
            List<GameStateModel> playersGames = new List<GameStateModel>()
            {
                new GameStateModel() { Players = new Player[] {new Player() { UserName = userName, DisplayName = displayName } }}
            };

            List<GameStateModel> result = _service.RemovePlayerFromGames(playersGames, userName);

            Assert.Empty(result[0].Players[0].UserName);
            Assert.Empty(result[0].Players[0].DisplayName);
        }

        [Fact]
        private void RemovePlayerFromGames_OnPlayerNotInGame_NotRemovesPlayerNames()
        {
            string userName = "player_one_userName";
            string otherName = "player_other_userName";
            string displayName = "player_one_displayName";
            List<GameStateModel> playersGames = new List<GameStateModel>()
            {
                new GameStateModel() { Players = new Player[] {new Player() { UserName = otherName, DisplayName = displayName } }}
            };

            List<GameStateModel> result = _service.RemovePlayerFromGames(playersGames, userName);

            Assert.Equal(otherName, result[0].Players[0].UserName);
            Assert.Equal(displayName, result[0].Players[0].DisplayName);
        }

        //RemoveGameIfEmpty



        //UpdateGame
        //todo:

    }
}
