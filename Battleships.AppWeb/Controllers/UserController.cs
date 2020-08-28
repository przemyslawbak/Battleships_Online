using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        UserManager<AppUser> _userManager;
        public UserController(UserManager<AppUser> userMgr)
        {
            _userManager = userMgr;
        }

        /// <summary>
        /// POST: api/user/register
        /// </summary>
        /// <returns>Creates a new User and return it accordingly.
        ///</returns>
        [HttpPost("Register")]
        public async Task<IActionResult> Add([FromBody]UserViewModel registerVm)
        {
            // return a generic HTTP Status 500 (Server Error)
            // if the client payload is invalid.
            if (registerVm == null) return new StatusCodeResult(500);
            // check if the Username/Email already exists
            AppUser user = await _userManager.FindByNameAsync(registerVm.UserName);
            if (user != null) return BadRequest("Username already exists");
            user = await _userManager.FindByEmailAsync(registerVm.Email);
            if (user != null) return BadRequest("Email already exists.");
            var now = DateTime.Now;
            // create a new Item with the client-sent json data
            user = new AppUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = registerVm.UserName,
                Email = registerVm.Email
            };
            // Add the user to the Db with the choosen password
            IdentityResult result = await _userManager.CreateAsync(user, registerVm.Password);

            if (result.Succeeded)
            {
                //todo
            }
            else
            {
                //todo - return result
            }
            // persist the changes into the Database.
            await _userManager.UpdateAsync(user);
            UserViewModel userVm = new UserViewModel()
            {
                UserName = user.UserName,
                DisplayName = user.UserName,
                Email = user.Email,
                Password = user.PasswordHash
            };

            // return the newly-created User to the client.
            return Json(userVm);
        }
    }
}
