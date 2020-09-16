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

        /// <summary>
        /// Creates new user and adds to the Db.
        /// </summary>
        /// <param name="registerVm">User inputs.</param>
        /// <returns>Boolean if succeeded or not.</returns>
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
        /// Finds user in DB by email address.
        /// </summary>
        /// <param name="email">Email address.</param>
        /// <returns>Boolean if user found.</returns>
        public async Task<AppUser> FindUserByEmail(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        /// <summary>
        /// Generates token for password reset.
        /// </summary>
        /// <param name="user">AppUser object.</param>
        /// <returns>Generated password reset token.</returns>
        public async Task<string> GetPassResetToken(AppUser user)
        {
            string token = await _userManager.GeneratePasswordResetTokenAsync(user);

            return token.Replace("/", "$");
        }

        /// <summary>
        /// Resetting user password.
        /// </summary>
        /// <param name="user">AppUser object.</param>
        /// <param name="token">User reset token.</param>
        /// <param name="password">User new password.</param>
        /// <returns>Boolean if succeeded or not.</returns>
        public async Task<bool> ResetPassword(AppUser user, string token, string password)
        {
            try
            {
                IdentityResult result = await _userManager.ResetPasswordAsync(user, token, password);

                if (result.Succeeded)
                {
                    await _userManager.UpdateAsync(user);

                    return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Generates new user name if the one passed already exists. In other case returns the same.
        /// </summary>
        /// <param name="userName">Initial user name.</param>
        /// <returns>Valid unique user name.</returns>
        public string GenerateUsername(string userName)
        {
            int count = 0;
            string name = userName;

            while (_userManager.Users.Any(x => x.UserName == name))
            {
                name = userName + count++.ToString();
            }

            return name;
        }

        /// <summary>
        /// Creates new AppUser object instance.
        /// </summary>
        /// <param name="model">AppUser model.</param>
        /// <returns>New AppUser.</returns>
        private AppUser CreateNewUser(UserViewModel model)
        {
            return new AppUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Email = model.Email,
                DisplayName = model.DisplayName
            };
        }

        /// <summary>
        /// Adds new user to the DB.
        /// </summary>
        /// <param name="user">Passed user.</param>
        /// <returns>Boolean if succeeded or not.</returns>
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
