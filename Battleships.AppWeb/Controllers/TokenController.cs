using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : Controller
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly ITokenRepository _tokenRepo;

        public TokenController(
            ITokenService tokenService,
            ITokenRepository tokenRepo,
            IUserService userService)
        {
            _tokenService = tokenService;
            _tokenRepo = tokenRepo;
            _userService = userService;
        }

        [HttpPost("auth")]
        public async Task<IActionResult> JsonWebToken([FromBody]TokenRequestViewModel model)
        {
            TempData["requstIp"] = GetIpAddress();

            if (model == null)
            {
                return new StatusCodeResult(500);
            }
            switch (model.GrantType)
            {
                case "password":
                    return await GetToken(model);
                default:
                    return new ObjectResult("Please try again.") { StatusCode = 409 };
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody]RefreshTokenRequestViewModel model)
        {
            TempData["requstIp"] = GetIpAddress();

            bool properToken = _tokenRepo.VerifyReceivedToken(model.RefreshToken, model.Email, TempData["requstIp"].ToString());

            if (!properToken)
            {
                return new ObjectResult("Please log in again.") { StatusCode = 409 };
            }

            return await GetToken(model);
        }

        [HttpPost("revoke-token")]
        public IActionResult RevokeToken([FromBody]RevokeTokenRequestViewModel model)
        {
            _tokenRepo.DeleteRefreshToken(model.UserName);
            _tokenService.CleanUpBlacklistedTokens();
            _tokenRepo.AddBlacklistedToken(model.Token);

            return Ok();
        }

        [HttpGet("external-login/{provider}")]
        public IActionResult ExternalLoginAsync(string provider, string returnUrl = null)
        {
            TempData["requstIp"] = GetIpAddress();
            string redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Token", new { ReturnUrl = returnUrl });
            AuthenticationProperties properties = _userService.GetExternalAuthenticationProperties(provider, "http://localhost:50962" + redirectUrl);
            return new ChallengeResult(provider, properties);
        }

        [HttpGet("ExternalLoginCallback")]
        public async Task<IActionResult> ExternalLoginCallback(string remoteError = null)
        {
            if (!string.IsNullOrEmpty(remoteError))
            {
                return new ObjectResult("External provider error: " + remoteError) { StatusCode = 503 };
            }

            ExternalLoginInfo info = await _userService.GetExternalLogin();

            if (info == null)
            {
                return new ObjectResult("External provider error.") { StatusCode = 503 };
            }

            AppUser user = await _userService.FindUserByEmail(info.Principal.FindFirst(ClaimTypes.Email).Value);

            if (user == null)
            {

                UserViewModel model = _userService.GetRegisterModel(info);

                bool result = await _userService.CreateNewUserAndAddToDbAsync(model);

                if (!result)
                {
                    return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
                }

                user = await _userService.FindUserByEmail(info.Principal.FindFirst(ClaimTypes.Email).Value);
            }

            TokenResponseViewModel response = _tokenService.GenerateResponse(user, TempData["requstIp"].ToString());

            return View(response);
        }

        private async Task<IActionResult> GetToken(RefreshTokenRequestViewModel model)
        {
            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null)
            {
                return new ObjectResult("Please log in again.") { StatusCode = 409 };
            }

            TokenResponseViewModel response = _tokenService.GenerateResponse(user, TempData["requstIp"].ToString());

            return Json(response);
        }

        private async Task<IActionResult> GetToken(TokenRequestViewModel model)
        {
            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null || !await _userService.VerifyUsersPassword(user, model.Password))
            {
                return new ObjectResult("Wrong email or password.") { StatusCode = 409 };
            }

            TokenResponseViewModel response = _tokenService.GenerateResponse(user, TempData["requstIp"].ToString());

            return Json(response);
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                return Request.Headers["X-Forwarded-For"];
            }
            else
            {
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            }
        }
    }
}