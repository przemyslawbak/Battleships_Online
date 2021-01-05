using Battleships.AppWeb.Controllers;
using Battleships.Models;
using Battleships.Services;
using Battleships.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Battleships.Tests.UnitTests.Controllers
{
    public class GameControllerTests
    {
        private readonly Mock<IMemoryAccess> _cacheMock;
        private readonly Mock<IGameService> _gameServiceMock;
        private readonly GameController _controller;

        public GameControllerTests()
        {
            _cacheMock = new Mock<IMemoryAccess>();
            _gameServiceMock = new Mock<IGameService>();

            _controller = new GameController(_cacheMock.Object, _gameServiceMock.Object);
        }

        [Fact]
        private void JoinGame_OnGameExisting_ReturnsJsonResult()
        {
            GameStateModel correctModel = new GameStateModel()
            {
                IsDeploymentAllowed = true,
                DisplayingResults = false,
                IsStartAllowed = true,
                FireCol = 10,
                FireResult = false,
                FireRow = 2,
                GameDifficulty = "foo1",
                GameId = 2,
                GameMulti = true,
                GameOpen = false,
                GameSpeedDivider = 1,
                GameTurnNumber = 3,
                GameTurnPlayer = 0
            };

            _cacheMock.Setup(mock => mock.GetGameById(It.IsAny<int>())).Returns(correctModel);
            int id = 1;

            IActionResult result = _controller.JoinGame(id);
            JsonResult resultObject = result as JsonResult;
            dynamic resultData = new JsonResultDynamicWrapper(resultObject);

            Assert.NotNull(result);
            Assert.IsType<JsonResult>(result);
            Assert.Equal("foo1", resultData.GameDifficulty);
            Assert.Equal(true, resultData.IsDeploymentAllowed);
            Assert.Equal(false, resultData.DisplayingResults);
            Assert.Equal(true, resultData.IsStartAllowed);
            Assert.Equal(10, resultData.FireCol);
            Assert.Equal(false, resultData.FireResult);
            Assert.Equal(2, resultData.FireRow);
            Assert.Equal(2, resultData.GameId);
            Assert.Equal(true, resultData.GameMulti);
            Assert.Equal(false, resultData.GameOpen);
            Assert.Equal(1, resultData.GameSpeedDivider);
            Assert.Equal(3, resultData.GameTurnNumber);
            Assert.Equal(0, resultData.GameTurnPlayer);
        }

        [Fact]
        private void JoinGame_OnGameNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Game does not exists.";
            _cacheMock.Setup(mock => mock.GetGameById(It.IsAny<int>())).Returns((GameStateModel)null);
            int id = 1;

            IActionResult result = _controller.JoinGame(id);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
