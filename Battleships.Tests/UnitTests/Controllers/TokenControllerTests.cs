using Battleships.AppWeb.Controllers;
using Battleships.Services;
using Moq;

namespace Battleships.Tests.UnitTests.Controllers
{
    public class TokenControllerTests
    {
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly Mock<IUserService> _usererviceMock;
        private readonly TokenController _controller;

        public TokenControllerTests()
        {
            _tokenServiceMock = new Mock<ITokenService>();
            _usererviceMock = new Mock<IUserService>();

            _controller = new TokenController(_tokenServiceMock.Object, _usererviceMock.Object);
        }
    }
}
