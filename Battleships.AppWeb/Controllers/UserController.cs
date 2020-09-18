using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    //todo: mock UserManager
    //todo: creating user identity result https://4programmers.net/Forum/C_i_.NET/343563-nowy_uzytkownik_api_endpoint?p=1703857#comment-625167
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly IInputSanitizer _sanitizer;
        private readonly IEmailSender _emailSender;
        private readonly IHttpService _http;

        public UserController(IUserService userService, IInputSanitizer sanitizer, IEmailSender emailSender, IHttpService http)
        {
            _userService = userService;
            _sanitizer = sanitizer;
            _emailSender = emailSender;
            _http = http;
        }

        /// <summary>
        /// POST: api/user/test
        /// </summary>
        /// <returns>Status code with object.</returns>
        [HttpGet("test")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult GetAuthTest()
        {
            return new OkObjectResult(new { Message = "This is secure data!" });
        }

        /// <summary>
        /// POST: api/user/admin
        /// </summary>
        /// <returns>Status code with object.</returns>
        [HttpGet("admin")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles ="Admin")]
        public IActionResult GetAdminTest()
        {
            return new OkObjectResult(new { Message = "This is data for admin only!" });
        }

        /// <summary>
        /// POST: api/user/reset
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("reset")]
        public async Task<IActionResult> PassChange([FromBody]PassResetEmailViewModel model)
        {
            RecaptchaVerificationResponseModel recaptchaResponse = await _http.VerifyCaptchaAsync(model.CaptchaToken, _userService.GetIpAddress(HttpContext));

            if (!recaptchaResponse.Success && recaptchaResponse.Score < 0.8) //todo: appsettings 0.8
            {
                return new ObjectResult("It looks like you are sending automated requests.") { StatusCode = 429 };
            }

            if (ModelState.IsValid)
            {
                model.Email = _sanitizer.CleanUp(model.Email);

                AppUser user = await _userService.FindUserByEmail(model.Email);

                if (user != null)
                {
                    string token = await _userService.GetPassResetToken(user);

                    string resetLink = "http://localhost:4200/pass-reset/" + model.Email + "/" + token;

                    try
                    {
                        await _emailSender.SendEmailAsync(model.Email, "Reset your password", "Please click or copy the password reset link to your browser: " + resetLink);

                        return Ok();
                    }
                    catch
                    {
                        return new ObjectResult("Email could not be sent.") { StatusCode = 502 };
                    }
                }
            }

            return new ObjectResult("Wrong email address.") { StatusCode = 409 };
        }

        /// <summary>
        /// POST: api/user/newpassword
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("new-password")]
        public async Task<IActionResult> PassReset([FromBody]ResetPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                model.Email = _sanitizer.CleanUp(model.Email);
                model.Password = _sanitizer.CleanUp(model.Password);

                AppUser user = await _userService.FindUserByEmail(model.Email);

                if (user != null)
                {
                    bool updated = await _userService.ResetPassword(user, model.Token, model.Password);

                    if (updated)
                    {
                        return Ok();
                    }
                    else
                    {
                        return new ObjectResult("Error when updating password.") { StatusCode = 500 };
                    }
                }
                else
                {
                    return new ObjectResult("Wrong email address.") { StatusCode = 409 };
                }
            }
            else
            {
                return View(model);
            }
        }

        /// <summary>
        /// POST: api/user/register
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("register")]
        public async Task<IActionResult> AddNewUser([FromBody]UserViewModel model)
        {
            RecaptchaVerificationResponseModel recaptchaResponse = await _http.VerifyCaptchaAsync(model.CaptchaToken, _userService.GetIpAddress(HttpContext));

            if (!recaptchaResponse.Success && recaptchaResponse.Score < 0.8) //todo: appsettings 0.8
            {
                return new ObjectResult("It looks like you are sending automated requests.") { StatusCode = 429 };
            }

            if (!ModelState.IsValid)
            {
                string errors = string.Join(", ", ModelState.Select(x => x.Value.Errors)
                           .Where(y => y.Count > 0)
                           .ToList());

                return new ObjectResult("Wrong register user input: " + errors + ".") { StatusCode = 422 };
            }

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
    }
}
