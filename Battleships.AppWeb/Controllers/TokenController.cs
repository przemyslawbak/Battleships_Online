using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : Controller
    {
        UserManager<AppUser> _userManager;
        private SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly ITokenRepository _tokenRepo;
        private readonly int _hoursKeepBlacklistedTokend = 5; //todo: move to _configuration

        public TokenController(
            UserManager<AppUser> userMgr,
            SignInManager<AppUser> signinMgr,
            ITokenService tokenService,
            ITokenRepository tokenRepo)
        {
            _signInManager = signinMgr;
            _userManager = userMgr;
            _tokenService = tokenService;
            _tokenRepo = tokenRepo;
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
        [HttpGet("ExternalLogin/{provider}")]
        public IActionResult ExternalLogin(string provider, string returnUrl = null)
        {
            switch (provider.ToLower())
            {
                case "facebook":
                    // case "google":
                    // case "twitter":
                    // todo: add all supported providers here
                    // Redirect the request to the external provider.
                    var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Token", new { ReturnUrl = returnUrl });
                    var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, "http://localhost:50962" + redirectUrl);
                    return new ChallengeResult(provider, properties);
                default:
                    // provider not supported
                    return BadRequest(new
                    {
                        Error = string.Format("Provider '{0}' is not supported.", provider)
                    });
            }
        }

        //todo: clean up and check
        [HttpGet("ExternalLoginCallback")]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            if (!string.IsNullOrEmpty(remoteError))
            {
                // TODO: handle external provider errors
                throw new Exception(string.Format("External Provider error: {0}", remoteError));
            }
            // Extract the login info obtained from the External Provider
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                // if there's none, emit an error
                throw new Exception("ERROR: No login info available.");
            }
            // Check if this user already registered himself with this external provider before
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user == null)
            {
                // If we reach this point, it means that this user never tried to logged in
                // using this external provider. However, it could have used other providers
                // and /or have a local account.
                // We can find out if that's the case by looking for his e-mail address.
                // Retrieve the 'emailaddress' claim
                var emailKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
                var email = info.Principal.FindFirst(emailKey).Value;
                // Lookup if there's an username with this e-mail address in the Db
                user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    // No user has been found: register a new user
                    // using the info retrieved from the provider
                    DateTime now = DateTime.Now;
                    // Create a unique username using the 'nameidentifier' claim
                    var idKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
                    var username = string.Format("{0}{1}{2}",
                    info.LoginProvider,
                    info.Principal.FindFirst(idKey).Value,
                    Guid.NewGuid().ToString("N"));
                    user = new AppUser()
                    {
                        SecurityStamp = Guid.NewGuid().ToString(),
                        UserName = username,
                        Email = email
                    };
                    // Add the user to the Db with a random password
                    IdentityResult register = await _userManager.CreateAsync(user, "SomerandoMp94084as(($_@$sowrdhardTobreak@*#%(!13285038");
                    // Remove Lockout and E-Mail confirmation
                    if (register.Succeeded)
                    {
                        //todo
                    }
                    else
                    {
                        //todo
                    };
                }
                else throw new Exception("Authentication error");
            }

            return Content("finito?"); //brakuje zalogowania jeśli już zarejestrowany, nei zamyka okna facebooka!!!!!!!!!!!!!!!!!!!!
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