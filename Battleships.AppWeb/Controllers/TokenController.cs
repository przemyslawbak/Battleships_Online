using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : Controller
    {
        private readonly IUserService _userService;
        private UserManager<AppUser> _userManager;
        private SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly ITokenRepository _tokenRepo;
        private readonly int _hoursKeepBlacklistedTokend = 5; //todo: move to _configuration

        public TokenController(
            UserManager<AppUser> userMgr,
            SignInManager<AppUser> signinMgr,
            ITokenService tokenService,
            ITokenRepository tokenRepo,
            IUserService userService)
        {
            _signInManager = signinMgr;
            _userManager = userMgr;
            _tokenService = tokenService;
            _tokenRepo = tokenRepo;
            _userService = userService;
        }

        [HttpPost("auth")]
        public async Task<IActionResult> JsonWebToken([FromBody]TokenRequestViewModel model)
        {
            if (model == null) return new StatusCodeResult(500);
            switch (model.grant_type)
            {
                case "password":
                    return await GetToken(model);
                default:
                    return new UnauthorizedResult(); //todo: status code
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody]RefreshTokenRequestViewModel model)
        {
            string ip = GetIpAddress();

            bool properToken = _tokenRepo.VerifyReceivedToken(model.refreshtoken, model.username, ip);

            if (!properToken)
            {
                return new UnauthorizedResult(); //todo: status code
            }

            return await GetToken(model);
        }

        [HttpPost("revoke-token")]
        public IActionResult RevokeToken([FromBody]RevokeTokenRequestViewModel model)
        {
            _tokenRepo.DeleteRefreshToken(model.username);
            _tokenRepo.CleanUpBlacklistedTokens(_hoursKeepBlacklistedTokend);
            _tokenRepo.AddBlacklistedToken(model.token);

            return Ok();
        }

        [HttpGet("external-login/{provider}")]
        public IActionResult ExternalLoginAsync(string provider, string returnUrl = null)
        {
            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Token", new { ReturnUrl = returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, "http://localhost:50962" + redirectUrl);
            return new ChallengeResult(provider, properties);
        }

        //todo: clean up and check
        [HttpGet("ExternalLoginCallback")]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            if (!string.IsNullOrEmpty(remoteError))
            {
                //todo: handle external provider errors
                throw new Exception(string.Format("External Provider error: {0}", remoteError));
            }

            ExternalLoginInfo info = await _signInManager.GetExternalLoginInfoAsync();

            if (info == null)
            {
                throw new Exception(string.Format("External Provider error, no user data"));
            }

            var user = await _userManager.FindByEmailAsync(info.Principal.FindFirst(ClaimTypes.Email).Value);

            if (user == null)
            {
                UserViewModel userRegisterVm = new UserViewModel()
                {
                    Email = info.Principal.FindFirst(ClaimTypes.Email).Value,
                    UserName = GenerateUsername(info.Principal.FindFirst(ClaimTypes.GivenName).Value),
                    Password = GenerateRandomString()
                };

                bool result = await _userService.CreateNewUserAndAddToDbAsync(userRegisterVm);

                if (!result)
                {
                    return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
                }

                //todo: register response
                return Content("registered");
            }
            else
            {
                TokenResponseViewModel response = GenerateResponse(user);

                return View(response);
            }
        }

        //todo: service
        private static string GenerateRandomString()
        {
            Random random = new Random();

            const string chars = "abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            return new string(Enumerable.Repeat(chars, 20).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        //todo: service
        private string GenerateUsername(string typedName)
        {
            int count = 0;
            string name = typedName;

            while (_userManager.Users.Any(x => x.UserName == name))
            {
                name = typedName + count++.ToString();
            }

            return name;
        }

        //todo: service?
        //todo: DRY
        private async Task<IActionResult> GetToken(RefreshTokenRequestViewModel model)
        {
            AppUser user = await _userManager.FindByNameAsync(model.username);

            if (user == null)
            {
                return new UnauthorizedResult(); //todo: status code
            }

            TokenResponseViewModel response = GenerateResponse(user);

            return Json(response);
        }

        //todo: service?
        //todo: DRY
        private async Task<IActionResult> GetToken(TokenRequestViewModel model)
        {
            AppUser user = await _userManager.FindByNameAsync(model.username);

            if (user == null && model.username.Contains("@"))
            {
                user = await _userManager.FindByEmailAsync(model.username);
            }

            if (user == null || !await _userManager.CheckPasswordAsync(user, model.password))
            {
                return new UnauthorizedResult(); //todo: status code
            }

            TokenResponseViewModel response = GenerateResponse(user);

            return Json(response);
        }

        private TokenResponseViewModel GenerateResponse(AppUser user)
        {
            SecurityToken token = _tokenService.GetSecurityToken(user);

            string encodedToken = new JwtSecurityTokenHandler().WriteToken(token);
            string refreshToken = _tokenService.GetRefreshToken();

            _tokenRepo.SaveRefreshToken(refreshToken, user.UserName, GetIpAddress());

            return new TokenResponseViewModel()
            {
                Token = encodedToken,
                Email = user.Email,
                User = user.UserName,
                RefreshToken = refreshToken
            };
        }

        //todo: service?
        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }

    }
}