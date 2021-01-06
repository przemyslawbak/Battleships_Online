using Battleships.Services;
using Moq;

namespace Battleships.Tests.UnitTests.Services
{
    public class MessengerTests
    {
        private readonly Mock<ISender> _senderMock;
        private readonly Mock<IMemoryAccess> _cacheMock;
        private readonly Messenger _service;

        public MessengerTests()
        {
            _senderMock = new Mock<ISender>();
            _cacheMock = new Mock<IMemoryAccess>();

            _service = new Messenger(_cacheMock.Object, _senderMock.Object);
        }

        //SendGameStateToUsersInGame
        //todo:

        //SendChatMessageToUsersInGame
        //todo:

        //SendChatMessageToUsersInGame
        //todo:
    }
}
