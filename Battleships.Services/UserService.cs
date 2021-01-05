using Battleships.DAL;
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
        private readonly IUserRepository _userRepo;
        private readonly SignInManager<AppUser> _signInManager;

        public UserService(UserManager<AppUser> userMgr, SignInManager<AppUser> signInManager, IUserRepository userRepo)
        {
            _userRepo = userRepo;
            _userManager = userMgr;
            _signInManager = signInManager;
        }

        public async Task<bool> CreateUserAsync(UserRegisterViewModel model)
        {
            AppUser user = CreateNewUser(model);

            IdentityResult result = await _userManager.CreateAsync(user, model.Password);
            IdentityResult roleResult = await _userManager.AddToRoleAsync(user, "User");

            if (!result.Succeeded || !roleResult.Succeeded)
            {
                return false;
            }

            IdentityResult update = await _userManager.UpdateAsync(user);

            if (!update.Succeeded)
            {
                return false;
            }

            return true;
        }

        public string GenerateRandomPassword()
        {
            Random random = new Random();
            const string chars = "abcdefghijklmnopqrtuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            return new string(Enumerable.Repeat(chars, 20).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public async Task<AppUser> FindUserByEmail(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<string> GetPassResetToken(AppUser user)
        {
            string token = await _userManager.GeneratePasswordResetTokenAsync(user);

            return token.Replace("/", "$");
        }

        public async Task<bool> ResetPassword(AppUser user, string token, string password)
        {
            IdentityResult reset = await _userManager.ResetPasswordAsync(user, token, password);

            if (!reset.Succeeded)
            {
                return false;
            }

            IdentityResult update = await _userManager.UpdateAsync(user);

            if (!update.Succeeded)
            {
                return false;
            }

            return true;
        }

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

        public AuthenticationProperties GetExternalAuthenticationProperties(string provider, string redirectUrl)
        {
            return _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        }

        public async Task<ExternalLoginInfo> GetExternalLogin()
        {
            return await _signInManager.GetExternalLoginInfoAsync();
        }

        public async Task<bool> VerifyUsersPassword(AppUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public UserRegisterViewModel GetRegisterModel(ExternalLoginInfo info)
        {
            return new UserRegisterViewModel()
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

        public async Task<string> GetUserNameById(string id)
        {
            AppUser user = await _userManager.FindByIdAsync(id);
            return user.UserName;
        }

        public async Task<bool> UpdateUser(EditUserViewModel model)
        {
            AppUser user = await _userManager.FindByNameAsync(model.UserName);

            if (user == null)
            {
                return false;
            }

            user.DisplayName = model.DisplayName;
            user.Email = model.Email;

            IdentityResult update = await _userManager.UpdateAsync(user);

            if (!update.Succeeded)
            {
                return false;
            }

            return true;
        }

        public bool AddWonGame(GameWinner model)
        {
            return _userRepo.AddWonGame(model);
        }

        public List<BestPlayersViewModel> GetTop10Players()
        {
            return _userRepo.GetTop10Players();
        }

        private AppUser CreateNewUser(UserRegisterViewModel model)
        {
            return new AppUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Email = model.Email,
                DisplayName = model.DisplayName
            };
        }

        public async Task<string> GetUserDisplayByName(string name)
        {
            AppUser user = await _userManager.FindByNameAsync(name);
            return user.DisplayName;
        }
    }
}
