using Battleships.Models.ViewModels;

namespace Battleships.Services
{
    public interface IInputSanitizer
    {
        string CleanUp(string input);
        UserRegisterViewModel SanitizeRegisteringUserInputs(UserRegisterViewModel model);
    }
}