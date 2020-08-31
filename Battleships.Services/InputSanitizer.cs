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

        public string Process(string input)
        {
            return _sanitizer.Sanitize(input);
        }
    }
}
