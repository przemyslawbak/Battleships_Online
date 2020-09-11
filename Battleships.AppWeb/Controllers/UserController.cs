using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    //todo: login after register
    //todo: mock UserManager
    //todo: creating user identity result https://4programmers.net/Forum/C_i_.NET/343563-nowy_uzytkownik_api_endpoint?p=1703857#comment-625167
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IUserService _userService;
        private readonly IInputSanitizer _sanitizer;
        private readonly IEmailSender _emailSender;

        public UserController(UserManager<AppUser> userMgr, IUserService userService, IInputSanitizer sanitizer, IEmailSender emailSender)
        {
            _userManager = userMgr;
            _userService = userService;
            _sanitizer = sanitizer;
            _emailSender = emailSender;
        }

        /// <summary>
        /// POST: api/user/test
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpGet("Test")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public IActionResult GetAuthTest()
        {
            return new OkObjectResult(new { Message = "This is secure data!" });
        }

        /// <summary>
        /// POST: api/user/reset
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("reset")]
        public async Task<IActionResult> PassChange([FromBody]PassResetEmailViewModel model)
        {
            if (ModelState.IsValid)
            {
                model.Email = _sanitizer.Process(model.Email);

                AppUser user = await _userManager.FindByEmailAsync(model.Email);

                if (user != null)
                {
                    string token = await _userManager.GeneratePasswordResetTokenAsync(user);
                    token = token.Replace("/", "$");
                    string email = model.Email;

                    string resetLink = "http://localhost:4200/pass-reset/" + model.Email + "/" + token;

                    try
                    {
                        await _emailSender.SendEmailAsync(email, "Reset your password", "Please click or copy the password reset link to your browser: " + resetLink);
                        return Ok();
                    }
                    catch
                    {
                        return new ObjectResult("Email could not be sent.") { StatusCode = 502 };
                    }
                }
                else
                {
                    return new ObjectResult("Wrong email address.") { StatusCode = 409 };
                }
            }
            else
            {
                return new ObjectResult("Wrong email address.") { StatusCode = 409 };
            }
        }

        /// <summary>
        /// POST: api/user/newpassword
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("new-password")]
        public async Task<IActionResult> PassReset([FromBody]ResetPasswordViewModel details)
        {
            if (ModelState.IsValid)
            {
                details.Email = _sanitizer.Process(details.Email);
                details.Password = _sanitizer.Process(details.Password);

                AppUser user = await _userManager.FindByEmailAsync(details.Email);

                if (user != null)
                {
                    IdentityResult result = await _userManager.ResetPasswordAsync(user, details.Token, details.Password);

                    if (result.Succeeded)
                    {
                        await _userManager.UpdateAsync(user);
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
                return View(details);
            }
        }

        /// <summary>
        /// POST: api/user/register
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("Register")]
        public async Task<IActionResult> AddNewUser([FromBody]UserViewModel userRegisterVm)
        {
            if (!_userService.VerifyPassedRegisterViewModel(userRegisterVm))
            {
                return new ObjectResult("Wrong register user input, or user is null.") { StatusCode = 422 };
            }

            if (!ModelState.IsValid)
            {
                string errors = string.Join(", ", ModelState.Select(x => x.Value.Errors)
                           .Where(y => y.Count > 0)
                           .ToList());

                return new ObjectResult("Wrong register user input: " + errors + ".") { StatusCode = 422 };
            }

            userRegisterVm = SanitizeRegisteringUserInputs(userRegisterVm);

            AppUser user = await _userManager.FindByNameAsync(userRegisterVm.UserName);

            if (user != null)
            {
                return new ObjectResult("Username already exists.") { StatusCode = 409 };
            }

            user = await _userManager.FindByEmailAsync(userRegisterVm.Email);

            if (user != null)
            {
                return new ObjectResult("Email already exists.") { StatusCode = 409 };
            }

            bool result = await _userService.CreateNewUserAndAddToDbAsync(userRegisterVm);

            if (!result)
            {
                return new ObjectResult("Error when creating new user.") { StatusCode = 500 };
            }

            return Ok();
        }

        /// <summary>
        /// Sanitizing user inputs
        /// </summary>
        /// <param name="userRegisterVm">Passed user vm</param>
        /// <returns>Sanitized user vm</returns>
        private UserViewModel SanitizeRegisteringUserInputs(UserViewModel userRegisterVm)
        {
            return new UserViewModel()
            {
                DisplayName = _sanitizer.Process(userRegisterVm.DisplayName),
                Email = _sanitizer.Process(userRegisterVm.Email),
                Password = _sanitizer.Process(userRegisterVm.Password),
                UserName = _sanitizer.Process(userRegisterVm.UserName)
            };
        }
    }
}
