using Battleships.Helpers;
using Battleships.Services;
using Microsoft.AspNetCore.Http;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.ActionFilters
{
    public class TokenManagerMiddlewareTests
    {
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly TokenManagerMiddleware _filter;
        private readonly Mock<RequestDelegate> _delegatetMock;
        private readonly HttpContext _context;

        public TokenManagerMiddlewareTests()
        {
            _tokenServiceMock = new Mock<ITokenService>();
            _delegatetMock = new Mock<RequestDelegate>();
            _context = new DefaultHttpContext();

            _tokenServiceMock.Setup(mock => mock.GetCurrentToken(It.IsAny<HttpContext>())).Returns("some_fancy_token");
            _tokenServiceMock.Setup(mock => mock.IsTokenBlacklisted(It.IsAny<string>())).Returns(false);

            _filter = new TokenManagerMiddleware(_tokenServiceMock.Object);
        }

        [Fact]
        private async Task InvokeAsync_OnTokenNotBlacklisted_NotChangesResponse()
        {
            RequestDelegate next = _delegatetMock.Object;
            await _filter.InvokeAsync(_context, next);

            Assert.NotNull(_context.Request);
            Assert.Equal(200, _context.Response.StatusCode);
        }

        [Fact]
        private async Task InvokeAsync_OnTokenBlacklisted_ResponseStatusCode401()
        {
            _tokenServiceMock.Setup(mock => mock.IsTokenBlacklisted(It.IsAny<string>())).Returns(true);

            RequestDelegate next = _delegatetMock.Object;
            await _filter.InvokeAsync(_context, next);

            Assert.NotNull(_context.Response);
            Assert.Equal(401, _context.Response.StatusCode);
        }
    }
}
