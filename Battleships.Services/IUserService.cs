using Battleships.Models;
using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IUserService
    {
        Task<bool> CreateNewUserAndAddToDbAsync(UserViewModel model);
        Task<AppUser> FindUserByEmail(string email);
        Task<string> GetPassResetToken(AppUser user);
        Task<bool> ResetPassword(AppUser user, string token, string password);
        string GenerateUsername(string userName);
        AuthenticationProperties GetExternalAuthenticationProperties(string provider, string v);
        Task<ExternalLoginInfo> GetExternalLogin();
        Task<bool> VerifyUsersPassword(AppUser user, string password);
        string GenerateRandomPassword();
        UserViewModel GetRegisterModel(ExternalLoginInfo info);
    }
}