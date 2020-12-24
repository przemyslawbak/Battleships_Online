using Battleships.AppWeb.Helpers;
using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly IUserRepository _userRepo;
        private readonly IInputSanitizer _sanitizer;
        private readonly IEmailSender _emailSender;

        public UserController(IUserService userService, IInputSanitizer sanitizer, IEmailSender emailSender, IUserRepository userRepo)
        {
            _userRepo = userRepo;
            _userService = userService;
            _sanitizer = sanitizer;
            _emailSender = emailSender;
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
            List<BestPlayersViewModel> list = _userRepo.GetTop10Players();
            return new OkObjectResult(list);
        }

        /// <summary>
        /// GET: api/user/winner
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("winner")]
        [ValidateModel]
        public IActionResult PostWinner([FromBody]GameWinner model)
        {
            bool result = _userRepo.AddWonGame(model);

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
        [ValidateModel]
        public async Task<IActionResult> PassChange([FromBody]PassResetEmailViewModel model)
        {
            model.Email = _sanitizer.CleanUp(model.Email);

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null)
            {
                return new ObjectResult("Wrong email address.") { StatusCode = 409 };
            }

            string token = await _userService.GetPassResetToken(user);

            string resetLink = "http://localhost:4200/pass-reset/" + model.Email + "/" + token;

            if (!await _emailSender.SendEmailAsync(model.Email, "Reset your password", "Please click or copy the password reset link to your browser: " + resetLink))
            {
                return new ObjectResult("Email could not be sent.") { StatusCode = 502 };
            }

            return Ok();
        }

        /// <summary>
        /// POST: api/user/newpassword
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("new-password")]
        [ValidateModel]
        public async Task<IActionResult> PassReset([FromBody]ResetPasswordViewModel model)
        {
            model.Email = _sanitizer.CleanUp(model.Email);
            model.Password = _sanitizer.CleanUp(model.Password);

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user == null)
            {
                return new ObjectResult("Wrong email address.") { StatusCode = 409 };
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
        [ValidateModel]
        public async Task<IActionResult> AddNewUser([FromBody]UserRegisterViewModel model)
        {
            model.UserName = _userService.GenerateUsername(model.UserName);

            model = _sanitizer.SanitizeRegisteringUserInputs(model);

            AppUser user = await _userService.FindUserByEmail(model.Email);

            if (user != null)
            {
                return new ObjectResult("Email already exists.") { StatusCode = 409 };
            }

            bool result = await _userService.CreateNewUserAndAddToDbAsync(model);

            if (!result)
            {
                return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
            }

            return Ok();
        }

        /// <summary>
        /// POST: api/user/edit
        /// </summary>
        /// <returns>Status code.</returns>


    }
}
