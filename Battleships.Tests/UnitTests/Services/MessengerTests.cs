using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.SignalR;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class MessengerTests
    {
        private readonly Mock<ISender> _senderMock;
        private readonly Mock<IMemoryAccess> _cacheMock;
        private readonly Mock<IUserNameValidator> _nameValidatorMock;
        private readonly Messenger _service;

        public MessengerTests()
        {
            _senderMock = new Mock<ISender>();
            _cacheMock = new Mock<IMemoryAccess>();
            _nameValidatorMock = new Mock<IUserNameValidator>();

            _service = new Messenger(_cacheMock.Object, _senderMock.Object, _nameValidatorMock.Object);
        }

        [Fact]
        private async Task SendGameStateToUsersInGame_OnGameSinglePlayerAndValidUserName_CallsRemoveGameFromMemoryOnceAndCallsSendGameState()
        {
            _nameValidatorMock.Setup(mock => mock.IsValidUserName(It.IsAny<string>())).Returns(true);
            Player[] players = new Player[] { new Player() { UserName = "name1", DisplayName = "name2" } };
            GameStateModel game = new GameStateModel() { GameMulti = false, GameId = 666, Players = players };
            Mock<IHubCallerClients> clientsMock = new Mock<IHubCallerClients>();

            await _service.SendGameStateToUsersInGame(game, clientsMock.Object);

            _cacheMock.Verify(mock => mock.RemoveGameFromMemory(game.GameId), Times.Once);
            _senderMock.Verify(mock => mock.SendGameState(It.IsAny<string>(), game, clientsMock.Object), Times.Once);
        }

        [Fact]
        private async Task SendGameStateToUsersInGame_OnGameMultiplayerAndNotValidUserName_CallsNeverRemoveGameFromMemoryAndCallsNeverSendGameState()
        {
            _nameValidatorMock.Setup(mock => mock.IsValidUserName(It.IsAny<string>())).Returns(false);
            Player[] players = new Player[] { new Player() { UserName = "", DisplayName = "" } };
            GameStateModel game = new GameStateModel() { GameMulti = true, GameId = 666, Players = players };
            Mock<IHubCallerClients> clientsMock = new Mock<IHubCallerClients>();

            await _service.SendGameStateToUsersInGame(game, clientsMock.Object);

            _cacheMock.Verify(mock => mock.RemoveGameFromMemory(game.GameId), Times.Never);
            _senderMock.Verify(mock => mock.SendGameState(It.IsAny<string>(), game, clientsMock.Object), Times.Never);
        }

        //SendChatMessageToUsersInGame
        
        [Fact]
        private async Task SendChatMessageToUsersInGame_OnValidUserName_CallsSendChatMesssage()
        {
            Player[] players = new Player[] { new Player() { UserName = "name1", DisplayName = "name2" } };
            GameStateModel game = new GameStateModel() { GameMulti = false, GameId = 666, Players = players };
            _nameValidatorMock.Setup(mock => mock.IsValidUserName(It.IsAny<string>())).Returns(true);
            string[] names = new string[] { game.Players[0].UserName };
            string message = "some_msg";
            Mock<IHubCallerClients> clientsMock = new Mock<IHubCallerClients>();

            await _service.SendChatMessageToUsersInGame(message, names, clientsMock.Object);

            _senderMock.Verify(mock => mock.SendChatMesssage(It.IsAny<string>(), message, clientsMock.Object), Times.Once);
        }
        
        [Fact]
        private async Task SendChatMessageToUsersInGame_OnNotValidUserName_CallsNeverSendChatMesssage()
        {
            Player[] players = new Player[] { new Player() { UserName = "", DisplayName = "" } };
            GameStateModel game = new GameStateModel() { GameMulti = false, GameId = 666, Players = players };
            _nameValidatorMock.Setup(mock => mock.IsValidUserName(It.IsAny<string>())).Returns(false);
            string[] names = new string[] { game.Players[0].UserName };
            string message = "some_msg";
            Mock<IHubCallerClients> clientsMock = new Mock<IHubCallerClients>();

            await _service.SendChatMessageToUsersInGame(message, names, clientsMock.Object);

            _senderMock.Verify(mock => mock.SendChatMesssage(It.IsAny<string>(), message, clientsMock.Object), Times.Never);
        }
    }
}
