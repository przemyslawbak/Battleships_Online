using Battleships.Services;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Helpers
{
    public class TokenManagerMiddleware : IMiddleware
    {
        private readonly ITokenService _tokenService;

        public TokenManagerMiddleware(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }

        public async Task InvokeAsync(HttpContext httpContext, RequestDelegate next)
        {
            string currentToken = _tokenService.GetCurrentToken(httpContext);

            if (!_tokenService.IsTokenBlacklisted(currentToken))
            {
                await next(httpContext);
                return;
            }

            httpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        }
    }
}
