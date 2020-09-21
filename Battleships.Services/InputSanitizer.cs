using Battleships.Models.ViewModels;
using Ganss.XSS;

namespace Battleships.Services
{
    //todo: mock sanitizer
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

        /// <summary>
        /// Sanitizing user inputs
        /// </summary>
        /// <param name="userRegisterVm">Passed user vm</param>
        /// <returns>Sanitized user vm</returns>
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
