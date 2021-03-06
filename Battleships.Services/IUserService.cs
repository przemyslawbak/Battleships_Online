﻿using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IUserService
    {
        Task<bool> CreateUserAsync(UserRegisterViewModel model);
        Task<AppUser> FindUserByEmail(string email);
        Task<string> GetPassResetToken(AppUser user);
        Task<bool> ResetPassword(AppUser user, string token, string password);
        string GenerateUsername(string userName);
        AuthenticationProperties GetExternalAuthenticationProperties(string provider, string v);
        Task<string> GetUserNameById(string id);
        Task<ExternalLoginInfo> GetExternalLogin();
        Task<bool> VerifyUsersPassword(AppUser user, string password);
        string GenerateRandomPassword();
        UserRegisterViewModel GetRegisterModel(ExternalLoginInfo info);
        string GetIpAddress(HttpContext httpContext);
        Task<string> GetUserRoleAsync(AppUser user);
        Task<bool> UpdateUser(EditUserViewModel model);
        bool AddWonGame(GameWinner model);
        List<BestPlayersViewModel> GetTop10Players();
        Task<string> GetDisplayNameByUserName(string callersUserName);
    }
}