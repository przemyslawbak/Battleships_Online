using Battleships.DAL;
using Battleships.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Battleships.Tests.UnitTests.Services
{
    public class TokenServiceTests
    {
        private readonly Mock<IConfiguration> _configtMock;
        private readonly Mock<ITokenRepository> _tokenRepoMock;
        private readonly TokenService _service;

        public TokenServiceTests()
        {
            _configtMock = new Mock<IConfiguration>();
            _tokenRepoMock = new Mock<ITokenRepository>();

            _service = new TokenService(_configtMock.Object, _tokenRepoMock.Object);
        }

        //Nothing to be tested.
    }
}
