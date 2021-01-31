using Battleships.Helpers;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;

        public TokenController(
            ITokenService tokenService,
            IUserService userService,
            IConfiguration config)
        {
            _tokenService = tokenService;
            _userService = userService;
            _configuration = config;
        }

        /// <summary>
        /// POST: api/token/auth
        /// </summary>
        /// <returns>Json result with response viewmodel.</returns>
        [HttpPost("auth")]
        [ValidateModel]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        public async Task<IActionResult> JsonWebToken([FromBody] TokenRequestViewModel model)
        {
            TempData["requestIp"] = _userService.GetIpAddress(HttpContext);

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null || !await _userService.VerifyUsersPassword(user, model.Password))
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            string role = await _userService.GetUserRoleAsync(user);

            return Json(_tokenService.GenerateTokenResponse(user, role, TempData["requestIp"].ToString()));
        }

        /// <summary>
        /// POST: api/token/refresh-token
        /// </summary>
        /// <returns>Json result with response viewmodel.</returns>
        [HttpPost("refresh-token")]
        [ValidateModel]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestViewModel model)
        {
            TempData["requestIp"] = _userService.GetIpAddress(HttpContext);

            if (!_tokenService.VerifyRefreshToken(model.RefreshToken, model.Email, TempData["requestIp"].ToString()))
            {
                return new ObjectResult("Please log in again.") { StatusCode = 409 };
            }

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null)
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            string role = await _userService.GetUserRoleAsync(user);

            return Json(_tokenService.GenerateTokenResponse(user, role, TempData["requestIp"].ToString()));
        }

        /// <summary>
        /// POST: api/token/revoke-token
        /// </summary>
        /// <returns>Returns 200 status code if successfull removes tokens for user logout.</returns>
        [HttpPost("revoke-token")]
        [ValidateModel]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        public IActionResult RevokeToken([FromBody] RevokeTokenRequestViewModel model)
        {
            if (!_tokenService.RevokeTokens(model))
            {
                return new ObjectResult("There was a problem logging the user out correctly.") { StatusCode = 500 };
            }

            return Ok();
        }

        /// <summary>
        /// GET: api/token/external-login/{provider}
        /// </summary>
        /// <returns>new ChallengeResult for ExternalLoginCallback.</returns>
        [HttpGet("external-login/{provider}")]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        public IActionResult ExternalLoginAsync(string provider, string returnUrl = null)
        {
            string appUrl = _configuration["Data:App_url"];
            TempData["requestIp"] = _userService.GetIpAddress(HttpContext);

            string redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Token", new { ReturnUrl = returnUrl });

            AuthenticationProperties properties = _userService.GetExternalAuthenticationProperties(provider, appUrl + redirectUrl);

            return new ChallengeResult(provider, properties);
        }

        /// <summary>
        /// GET: api/token/ExternalLoginCallback
        /// </summary>
        /// <returns>Registers new user or logins existing user, and returns response data to the window being opened by AppClient.</returns>
        [HttpGet("ExternalLoginCallback")]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        public async Task<IActionResult> ExternalLoginCallback(string remoteError = null)
        {
            if (!string.IsNullOrEmpty(remoteError))
            {
                return new ObjectResult("External provider error: " + remoteError + ".") { StatusCode = 503 };
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

                if (!await _userService.CreateUserAsync(model))
                {
                    return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
                }

                user = await _userService.FindUserByEmail(model.Email);
            }

            string role = await _userService.GetUserRoleAsync(user);

            return View(_tokenService.GenerateTokenResponse(user, role, TempData["requestIp"].ToString()));
        }
    }
}