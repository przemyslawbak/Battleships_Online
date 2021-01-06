using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.SignalR;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class GameServiceTests
    {
        private readonly Mock<IMemoryAccess> _cacheMock;
        private readonly Mock<IMessenger> _messengerMock;
        private readonly Mock<IUserNameValidator> _nameValidatorMock;
        private readonly GameService _service;

        public GameServiceTests()
        {
            _cacheMock = new Mock<IMemoryAccess>();
            _messengerMock = new Mock<IMessenger>();
            _nameValidatorMock = new Mock<IUserNameValidator>();

            _service = new GameService(_cacheMock.Object, _messengerMock.Object, _nameValidatorMock.Object);
        }

        //RemoveEmptyGames

        [Theory]
        [InlineData(false, 1)]
        [InlineData(true, 0)]
        private void RemoveEmptyGames_OnUserNameValues_ReturnsListItems(bool isGameEmpty, int expected)
        {
            string userName = "player_one_userName";
            string otherName = "player_one_otherName";
            GameListedViewModel game = new GameListedViewModel() { Players = new string[] { userName, otherName } };
            List<GameListedViewModel> games = new List<GameListedViewModel>();
            games.Add(game);
            string[] players = new string[] { game.Players[0], game.Players[1] };
            _nameValidatorMock.Setup(mock => mock.IsGameEmpty(players)).Returns(isGameEmpty);

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

        [Theory]
        [InlineData(false, 1, 0)]
        [InlineData(true, 0, 1)]
        private async Task RemoveGameIfEmpty_OnUserNameValues_ReturnsListItems(bool isGameEmpty, int gameNotEmpty, int gameEmpty)
        {
            string user0Name = "player_0_userName";
            string user1Name = "player_1_userName";
            GameStateModel game = new GameStateModel() { Players = new Player[] { new Player() { UserName = user0Name }, new Player() { UserName = user1Name } }, GameId = 666 };
            Mock<IHubCallerClients> clientsMock = new Mock<IHubCallerClients>();
            string[] players = new string[] { game.Players[0].UserName, game.Players[1].UserName };
            _nameValidatorMock.Setup(mock => mock.IsGameEmpty(players)).Returns(isGameEmpty);

            await _service.RemoveGameIfEmpty(game, clientsMock.Object);

            _cacheMock.Verify(mock => mock.RemoveGameFromMemory(game.GameId), Times.Exactly(gameEmpty));
            _cacheMock.Verify(mock => mock.UpdateGame(game, clientsMock.Object), Times.Exactly(gameNotEmpty));
            _messengerMock.Verify(mock => mock.SendGameStateToUsersInGame(game, clientsMock.Object), Times.Exactly(gameNotEmpty));
        }
    }
}
