using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
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
        private readonly IUserValidation _validator;
        private readonly IInputSanitizer _sanitizer;

        public UserController(UserManager<AppUser> userMgr, IUserValidation validator, IInputSanitizer sanitizer)
        {
            _userManager = userMgr;
            _validator = validator;
            _sanitizer = sanitizer;
        }

        /// <summary>
        /// POST: api/user/register
        /// </summary>
        /// <returns>Creates a new User and return it accordingly.</returns>
        [HttpPost("Register")]
        public async Task<IActionResult> AddNewUser([FromBody]UserViewModel userRegisterVm)
        {
            if (!_validator.VerifyPassedRegisterViewModel(userRegisterVm))
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

            bool result = await CreateNewUserAndAddToDbAsync(userRegisterVm);

            if (!result)
            {
                return new ObjectResult("Error when creating new user.") { StatusCode = 409 };
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

        /// <summary>
        /// Creates new user and adds to the Db
        /// </summary>
        /// <param name="registerVm">User inputs</param>
        /// <returns>Boolean if succeeded or not</returns>
        private async Task<bool> CreateNewUserAndAddToDbAsync(UserViewModel registerVm)
        {
            AppUser user = CreateNewUser(registerVm);


            IdentityResult result = await _userManager.CreateAsync(user, registerVm.Password);

            if (!result.Succeeded)
            {
                return false;
            }

            if (!await UpdateDbWithNewUser(user))
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Creates new user
        /// </summary>
        /// <param name="registerVm">User inputs</param>
        /// <returns>New user</returns>
        private AppUser CreateNewUser(UserViewModel registerVm)
        {
            return new AppUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = registerVm.UserName,
                Email = registerVm.Email
            };
        }

        /// <summary>
        /// Adds new user to the Db
        /// </summary>
        /// <param name="user">Passed user</param>
        /// <returns>Boolean if succeeded or not</returns>
        private async Task<bool> UpdateDbWithNewUser(AppUser user)
        {
            try
            {
                await _userManager.UpdateAsync(user);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
