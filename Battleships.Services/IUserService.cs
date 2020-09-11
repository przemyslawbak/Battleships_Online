using Battleships.Models.ViewModels;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IUserService
    {
        bool VerifyPassedRegisterViewModel(UserViewModel registerVm);
        Task<bool> CreateNewUserAndAddToDbAsync(UserViewModel userRegisterVm);
    }
}