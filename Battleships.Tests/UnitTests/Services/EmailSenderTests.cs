using Battleships.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Battleships.Tests.UnitTests.Services
{
    public class EmailSenderTests
    {
        private readonly Mock<IConfiguration> _config;
        private readonly EmailSender _service;

        public EmailSenderTests()
        {
            _config = new Mock<IConfiguration>();

            _service = new EmailSender(_config.Object);
        }

        //Nothing to be tested.
    }
}
