using Battleships.Models.ViewModels;
using Ganss.XSS;

namespace Battleships.Services
{
    public class InputSanitizer : IInputSanitizer
    {
        private readonly HtmlSanitizer _sanitizer;
        public InputSanitizer()
        {
            _sanitizer = new HtmlSanitizer();
        }

        public string CleanUp(string input)
        {
            return _sanitizer.Sanitize(input);
        }

        public UserRegisterViewModel SanitizeRegisteringUserInputs(UserRegisterViewModel userRegisterVm)
        {
            return new UserRegisterViewModel()
            {
                DisplayName = CleanUp(userRegisterVm.DisplayName),
                Email = CleanUp(userRegisterVm.Email),
                Password = CleanUp(userRegisterVm.Password),
                UserName = CleanUp(userRegisterVm.UserName)
            };
        }
    }
}
