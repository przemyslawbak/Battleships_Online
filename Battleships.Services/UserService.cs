using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<AppUser> _userManager;

        public UserService(UserManager<AppUser> userMgr)
        {
            _userManager = userMgr;
        }

        public bool VerifyPassedRegisterViewModel(UserViewModel registerVm)
        {
            if (registerVm == null)
            {
                return false;
            }

            if (registerVm.GetType().GetProperties().All(p => p.GetValue(registerVm) == null))
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Creates new user and adds to the Db
        /// </summary>
        /// <param name="registerVm">User inputs</param>
        /// <returns>Boolean if succeeded or not</returns>
        public async Task<bool> CreateNewUserAndAddToDbAsync(UserViewModel registerVm)
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
