using Battleships.Models.ViewModels;

namespace Battleships.Services
{
    public interface IInputSanitizer
    {
        string CleanUp(string input);
        UserViewModel SanitizeRegisteringUserInputs(UserViewModel model);
    }
}