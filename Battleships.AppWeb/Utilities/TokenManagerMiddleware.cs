using Battleships.DAL;
using Battleships.Services;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Utilities
{
    public class TokenManagerMiddleware : IMiddleware
    {
        private readonly ITokenService _tokenService;
        private readonly ITokenRepository _tokenRepo;

        public TokenManagerMiddleware(ITokenService tokenService, ITokenRepository tokenRepo)
        {
            _tokenService = tokenService;
            _tokenRepo = tokenRepo;
        }

        public async Task InvokeAsync(HttpContext httpContext, RequestDelegate next)
        {
            string currentToken = _tokenService.GetCurrentToken();
            bool isTokenBlacklisted = _tokenRepo.VeriFyTokenBan(currentToken);

            if (!isTokenBlacklisted)
            {
                await next(httpContext);
                return;
            }

            httpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        }
    }
}
