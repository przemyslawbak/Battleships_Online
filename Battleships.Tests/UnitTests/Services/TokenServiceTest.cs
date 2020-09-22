using Battleships.DAL;
using Battleships.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Battleships.Tests.UnitTests.Services
{
    public class TokenServiceTest
    {
        private readonly Mock<IConfiguration> _configtMock;
        private readonly Mock<ITokenRepository> _tokenRepoMock;
        private readonly TokenService _service;

        public TokenServiceTest()
        {
            _configtMock = new Mock<IConfiguration>();
            _tokenRepoMock = new Mock<ITokenRepository>();

            _service = new TokenService(_configtMock.Object, _tokenRepoMock.Object);
        }

        //Nothing to be tested.
    }
}
