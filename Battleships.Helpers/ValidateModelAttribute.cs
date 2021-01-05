using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace Battleships.Helpers
{
    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.ActionArguments.Any(kv => kv.Value == null))
            {
                context.Result = new ObjectResult("Bad request.") { StatusCode = 400 };
            }

            if (context.ModelState.IsValid == false)
            {
                string errors = string.Join(", ", context.ModelState.Values.SelectMany(v => v.Errors.Select(b => b.ErrorMessage)));

                context.Result = new ObjectResult(errors + ".") { StatusCode = 409 };
            }
        }
    }
}
