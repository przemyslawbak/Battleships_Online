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

        public TokenController(
            ITokenService tokenService,
            IUserService userService)
        {
            _tokenService = tokenService;
            _userService = userService;
        }

        [HttpPost("auth")]
        public async Task<IActionResult> JsonWebToken([FromBody]TokenRequestViewModel model)
        {
            TempData["requstIp"] = _userService.GetIpAddress(HttpContext);

            if (model == null)
            {
                return new StatusCodeResult(500);
            }

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null || !await _userService.VerifyUsersPassword(user, model.Password))
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            string role = await _userService.GetUserRoleAsync(user);

            return Json(_tokenService.GenerateTokenResponse(user, role, TempData["requstIp"].ToString()));
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody]RefreshTokenRequestViewModel model)
        {
            TempData["requstIp"] = _userService.GetIpAddress(HttpContext);

            if (!_tokenService.VerifyRefreshToken(model.RefreshToken, model.Email, TempData["requstIp"].ToString()))
            {
                return new ObjectResult("Please log in again.") { StatusCode = 409 };
            }

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null) //todo: dry
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            string role = await _userService.GetUserRoleAsync(user);

            return Json(_tokenService.GenerateTokenResponse(user, role, TempData["requstIp"].ToString()));
        }

        [HttpPost("revoke-token")]
        public IActionResult RevokeToken([FromBody]RevokeTokenRequestViewModel model)
        {
            if (_tokenService.RevokeTokens(model))
            {
                return Ok();
            }
            else
            {
                return new ObjectResult("There was a problem logging the user out correctly.") { StatusCode = 500 };
            }

        }

        [HttpGet("external-login/{provider}")]
        public IActionResult ExternalLoginAsync(string provider, string returnUrl = null)
        {
            TempData["requstIp"] = _userService.GetIpAddress(HttpContext);

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

                UserRegisterViewModel model = _userService.GetRegisterModel(info);

                if (!await _userService.CreateNewUserAndAddToDbAsync(model))
                {
                    return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
                }

                user = await _userService.FindUserByEmail(info.Principal.FindFirst(ClaimTypes.Email).Value);
            }

            string role = await _userService.GetUserRoleAsync(user);

            return View(_tokenService.GenerateTokenResponse(user, role, TempData["requstIp"].ToString()));
        }
    }
}