using Battleships.Services;
using Moq;

namespace Battleships.Tests.UnitTests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IInputSanitizer> _sanitizerMock;
        private readonly Mock<IEmailSender> _emailSenderMock;

        public UserControllerTests()
        {
            _userServiceMock = new Mock<IUserService>();
            _sanitizerMock = new Mock<IInputSanitizer>();
            _emailSenderMock = new Mock<IEmailSender>();
        }
    }
}
