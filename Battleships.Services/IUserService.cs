using Battleships.Models;
using Battleships.Models.ViewModels;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IUserService
    {
        Task<bool> CreateNewUserAndAddToDbAsync(UserViewModel userRegisterVm);
        Task<AppUser> FindUserByEmail(string email);
        Task<string> GetPassResetToken(AppUser user);
        Task<bool> ResetPassword(AppUser user, string token, string password);
        string GenerateUsername(string userName);
    }
}