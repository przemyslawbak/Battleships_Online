using Battleships.Helpers;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private IHostingEnvironment _hostingEnv;
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly IEmailSender _emailSender;

        public UserController(
            IUserService userService,
            IEmailSender emailSender,
            IConfiguration config,
            IHostingEnvironment hostingEnv)
        {
            _userService = userService;
            _emailSender = emailSender;
            _configuration = config;
            _hostingEnv = hostingEnv;
        }

        /// <summary>
        /// GET: api/user/test
        /// </summary>
        /// <returns>Status code with object.</returns>
        [HttpGet("test")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult GetAuthTest()
        {
            return new OkObjectResult(new { Message = "This is secure data!" });
        }

        /// <summary>
        /// GET: api/user/admin
        /// </summary>
        /// <returns>Status code with object.</returns>
        [HttpGet("admin")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles ="Admin")]
        public IActionResult GetAdminTest()
        {
            return new OkObjectResult(new { Message = "This is data for admin only!" });
        }

        /// <summary>
        /// GET: api/user/best
        /// </summary>
        /// <returns>List of top 10 players.</returns>
        [HttpGet("best")]
        public IActionResult GetBestPLayers()
        {
            List<BestPlayersViewModel> list = _userService.GetTop10Players();
            return new OkObjectResult(list);
        }

        /// <summary>
        /// GET: api/user/winner
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("winner")]
        [ValidateModel]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult PostWinner([FromBody]GameWinner model)
        {
            bool result = _userService.AddWonGame(model);

            if (!result)
            {
                return new ObjectResult("Error when saving winner.") { StatusCode = 409 };
            }

            return Ok();
        }

        /// <summary>
        /// POST: api/user/reset
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("reset")]
        [ServiceFilter(typeof(VerifyCaptchaAttribute))]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        [ValidateModel]
        public async Task<IActionResult> PassChange([FromBody]PassResetEmailViewModel model)
        {
            if (_hostingEnv.IsEnvironment("Production"))
            {
                if (model.Email == "clicker1@email.com" || model.Email == "clicker2@email.com")
                {
                    return new ObjectResult("Clicker account can not be modified. Please create new one to test this feature.") { StatusCode = 423 };
                }
            }
            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null)
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            string token = await _userService.GetPassResetToken(user);
            string passResetUrl = _configuration["Data:PassReset_url"];

            string resetLink = passResetUrl + model.Email + "/" + token;

            if (!await _emailSender.SendEmailAsync(model.Email, "Reset your password", "Please click or copy the password reset link to your browser: " + resetLink))
            {
                return new ObjectResult("Email could not be sent.") { StatusCode = 502 };
            }

            return Ok();
        }

        /// <summary>
        /// PUT: api/user/newpassword
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPut("new-password")]
        [ValidateModel]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        public async Task<IActionResult> PassReset([FromBody]ResetPasswordViewModel model)
        {
            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null)
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            if (!await _userService.ResetPassword(user, model.Token, model.Password))
            {
                return new ObjectResult("Error when updating password.") { StatusCode = 500 };
            }

            return Ok();
        }

        /// <summary>
        /// POST: api/user/register
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("register")]
        [ServiceFilter(typeof(VerifyCaptchaAttribute))]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        [ValidateModel]
        public async Task<IActionResult> AddNewUser([FromBody]UserRegisterViewModel model)
        {
            model.UserName = _userService.GenerateUsername(model.UserName);

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user != null)
            {
                return new ObjectResult("Invalid user details.") { StatusCode = 409 };
            }

            bool result = await _userService.CreateUserAsync(model);

            if (!result)
            {
                return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
            }

            return Ok();
        }

        /// <summary>
        /// PUT: api/user/edit
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPut("edit")]
        [ValidateModel]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public async Task<IActionResult> EditUser([FromBody] EditUserViewModel model)
        {
            if (_hostingEnv.IsEnvironment("Production"))
            {
                if (model.Email == "clicker1@email.com" || model.Email == "clicker2@email.com")
                {
                    return new ObjectResult("Clicker account can not be modified. Please create new one to test this feature.") { StatusCode = 423 };
                }
            }
            bool result = await _userService.UpdateUser(model);

            if (!result)
            {
                return new ObjectResult("Error when updating user.") { StatusCode = 500 };
            }

            return Ok();
        }

    }
}
