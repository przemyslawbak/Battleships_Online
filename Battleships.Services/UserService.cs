using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public UserService(UserManager<AppUser> userMgr, SignInManager<AppUser> signInManager)
        {
            _userManager = userMgr;
            _signInManager = signInManager;
        }

        /// <summary>
        /// Creates new user, attaches 'User' role and adds to the Db.
        /// </summary>
        /// <param name="registerVm">User inputs.</param>
        /// <returns>Boolean if succeeded or not.</returns>
        public async Task<bool> CreateNewUserAndAddToDbAsync(UserViewModel model)
        {
            AppUser user = CreateNewUser(model);


            IdentityResult result = await _userManager.CreateAsync(user, model.Password);
            IdentityResult roleResult = await _userManager.AddToRoleAsync(user, "User");

            if (!result.Succeeded || roleResult.Succeeded)
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
        /// Generates random password.
        /// </summary>
        /// <returns>Random password string.</returns>
        public string GenerateRandomPassword()
        {
            Random random = new Random();

            const string chars = "abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            return new string(Enumerable.Repeat(chars, 20).Select(s => s[random.Next(s.Length)]).ToArray());
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

        /// <summary>
        /// Gets external auth properties.
        /// </summary>
        /// <param name="provider">Providers name.</param>
        /// <param name="redirectUrl">Redirection URL.</param>
        /// <returns>Authentication properties.</returns>
        public AuthenticationProperties GetExternalAuthenticationProperties(string provider, string redirectUrl)
        {
            return _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        }

        /// <summary>
        /// Gets external login info.
        /// </summary>
        /// <returns>External login info.</returns>
        public async Task<ExternalLoginInfo> GetExternalLogin()
        {
            return await _signInManager.GetExternalLoginInfoAsync();
        }

        /// <summary>
        /// VErifies if password is correct for the user.
        /// </summary>
        /// <param name="user">AppUser object.</param>
        /// <param name="password">Password to be verified.</param>
        /// <returns>Boolean if the password is correct.</returns>
        public async Task<bool> VerifyUsersPassword(AppUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public UserViewModel GetRegisterModel(ExternalLoginInfo info)
        {
            return new UserViewModel()
            {
                Email = info.Principal.FindFirst(ClaimTypes.Email).Value,
                UserName = GenerateUsername(info.Principal.FindFirst(ClaimTypes.GivenName).Value),
                Password = GenerateRandomPassword(),
                DisplayName = info.Principal.FindFirst(ClaimTypes.GivenName).Value
            };
        }

        public string GetIpAddress(HttpContext httpContext)
        {
            return httpContext.Features.Get<IHttpConnectionFeature>()?.RemoteIpAddress.MapToIPv4().ToString();
        }

        public async Task<string> GetUserRoleAsync(AppUser user)
        {
            IList<string> roles = await _userManager.GetRolesAsync(user);

            return roles.FirstOrDefault();
        }
    }
}
