using Battleships.Models.ViewModels;

namespace Battleships.Services
{
    public interface IUserValidation
    {
        bool VerifyPassedRegisterViewModel(UserViewModel registerVm);
    }
}