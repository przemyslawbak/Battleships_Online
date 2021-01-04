using Battleships.Services;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Collections.Generic;
using System.Linq;

namespace Battleships.Helpers
{
    public class SanitizeModelAttribute : ActionFilterAttribute
    {
        private readonly IInputSanitizer _sanitizer;

        public SanitizeModelAttribute(IInputSanitizer sanitizer)
        {
            _sanitizer = sanitizer;
        }

        public void OnActionExecution(ActionExecutingContext context)
        {
            List<KeyValuePair<string, object>> stringArgs = context.ActionArguments.Where(pair => pair.Value is string).ToList();
            foreach (var keyValue in stringArgs)
            {
                string safeValue = SanitizeString((string)keyValue.Value);
                context.ActionArguments[keyValue.Key] = safeValue;
            }
        }

        private string SanitizeString(string value)
        {
            return _sanitizer.CleanUp(value);
        }
    }
}
