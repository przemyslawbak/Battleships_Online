using Battleships.AppWeb.Helpers;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.ActionFilters
{
    public class VerifyCaptchaAttributeTests
    {
        private Mock<ActionContext> _actionContextMock;
        private ActionExecutingContext _actionExecutingContext;
        private Dictionary<string, object> _actionArguments;
        private ModelStateDictionary _modelState;
        private readonly Mock<IHttpService> _httpMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly VerifyCaptchaAttribute _filter;
        private readonly ActionExecutionDelegate _next;
        private RouteData _routeData;
        private readonly PassResetEmailViewModel _model;

        public VerifyCaptchaAttributeTests()
        {
            _model = new PassResetEmailViewModel()
            {
                CaptchaToken = "some_fancy_token",
                Email = "some_fancy_email@gmail.com"
            };
            _routeData = new RouteData();
            _routeData.Values.Add("action", "PassChange");
            _modelState = new ModelStateDictionary();
            _actionArguments = new Dictionary<string, object>()
            {
                { "model", _model }
            };
            _actionContextMock = GetActionContextMock();
            _actionExecutingContext = GetActionExecutingContext();
            _httpMock = new Mock<IHttpService>();
            _userServiceMock = new Mock<IUserService>();
            _next = () =>
            {
                ActionExecutedContext ctx = new ActionExecutedContext(_actionContextMock.Object, new List<IFilterMetadata>(), new Mock<Controller>().Object);
                return Task.FromResult(ctx);
            };

            _userServiceMock.Setup(mock => mock.GetIpAddress(_actionContextMock.Object.HttpContext)).Returns("127.0.0.1");
            _httpMock.Setup(mock => mock.VerifyCaptchaAsync(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);

            _filter = new VerifyCaptchaAttribute(_httpMock.Object, _userServiceMock.Object);
        }

        /// <summary>
        /// Returns created ActionExecutingContext object. 
        /// </summary>
        /// <returns>ActionExecutingContext object.</returns>
        private ActionExecutingContext GetActionExecutingContext()
        {
            var controllerMock = new Mock<Controller>();
            var dictionary = _actionArguments;
            var filter = new List<IFilterMetadata>();

            return new ActionExecutingContext(_actionContextMock.Object, filter, dictionary, controllerMock.Object);
        }

        /// <summary>
        /// Returns created mock of ActionContext.
        /// </summary>
        /// <returns>Mock of ActionContext.</returns>
        private Mock<ActionContext> GetActionContextMock()
        {
            var contextMock = new Mock<HttpContext>();
            var routeData = _routeData;
            var actionMock = new Mock<ActionDescriptor>();

            return new Mock<ActionContext>(contextMock.Object, routeData, actionMock.Object, _modelState);
        }

        [Fact]
        private async Task OnActionExecuting_OnCorrectActionNameAndPositiveTokenVerification_ResultIsNull()
        {
            await _filter.OnActionExecutionAsync(_actionExecutingContext, _next);

            Assert.Null(_actionExecutingContext.Result);
        }

        [Fact]
        private async Task OnActionExecuting_OnWrongActionName_ResultIs400()
        {
            _routeData = new RouteData();
            _routeData.Values.Add("action", "WrongActionName");
            _actionContextMock = GetActionContextMock();
            _actionExecutingContext = GetActionExecutingContext();
            string expectedErrorsResult = "Bad request.";
            await _filter.OnActionExecutionAsync(_actionExecutingContext, _next);

            IActionResult result = _actionExecutingContext.Result;
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status400BadRequest, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task OnActionExecuting_OnCaptchaTokenVerificationFailed_ResultIs429()
        {
            _httpMock.Setup(mock => mock.VerifyCaptchaAsync(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);
            string expectedErrorsResult = "It looks like you are sending automated requests.";
            await _filter.OnActionExecutionAsync(_actionExecutingContext, _next);

            IActionResult result = _actionExecutingContext.Result;
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status429TooManyRequests, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
