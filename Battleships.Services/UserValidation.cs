using Battleships.Models.ViewModels;
using System.Linq;

namespace Battleships.Services
{
    public class UserValidation : IUserValidation
    {
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
    }
}
