﻿using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Threading.Tasks;

namespace Battleships.Helpers
{
    public class VerifyCaptchaAttribute : ActionFilterAttribute
    {
        private readonly IHttpService _http;
        private readonly IUserService _userService;

        public VerifyCaptchaAttribute(IHttpService http, IUserService userService)
        {
            _userService = userService;
            _http = http;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            string actionName = context.RouteData.Values["action"] as string;
            string token = string.Empty;
            bool verificationSuccess;

            if (actionName == "PassChange")
            {
                PassResetEmailViewModel model = context.ActionArguments["model"] as PassResetEmailViewModel;
                token = model.CaptchaToken;
            }
            else if (actionName == "AddNewUser")
            {
                UserRegisterViewModel model = context.ActionArguments["model"] as UserRegisterViewModel;
                token = model.CaptchaToken;
            }
            else
            {
                context.Result = new ObjectResult("Bad request.") { StatusCode = 400 };

                return;
            }

            string ip = _userService.GetIpAddress(context.HttpContext);

            verificationSuccess = await _http.VerifyCaptchaAsync(token, ip);

            if (!verificationSuccess)
            {
                context.Result = new ObjectResult("Oops! Something went wrong.") { StatusCode = 429 };

                return;
            }

            await next();
        }
    }
}
