using Battleships.Services;
using Moq;

namespace Battleships.Tests.UnitTests.Services
{
    public class MessengerTests
    {
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IMemoryAccess> _cacheMock;
        private readonly Messenger _service;

        public MessengerTests()
        {
            _userServiceMock = new Mock<IUserService>();
            _cacheMock = new Mock<IMemoryAccess>();

            _service = new Messenger(_userServiceMock.Object, _cacheMock.Object);
        }

        //SendGameStateToUsersInGame
        //todo:

        //SendChatMessageToUsersInGame
        //todo:

        //SendChatMessageToUsersInGame
        //todo:
    }
}
