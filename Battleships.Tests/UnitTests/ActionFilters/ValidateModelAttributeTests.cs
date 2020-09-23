using Battleships.AppWeb.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Moq;
using System.Collections.Generic;
using Xunit;

namespace Battleships.Tests.UnitTests.ActionFilters
{
    public class ValidateModelAttributeTests
    {
        private Mock<ActionContext> _actionContext;
        private ActionExecutingContext _actionExecutingContext;
        private Dictionary<string, object> _actionArguments;
        private readonly ModelStateDictionary _modelState;
        private readonly ValidateModelAttribute _filter;

        public ValidateModelAttributeTests()
        {
            _modelState = new ModelStateDictionary();
            _actionArguments = new Dictionary<string, object>()
            {
                { "name", "Pszemek" }
            };
            _actionContext = GetActionContext();
            _actionExecutingContext = GetActionExecutingContext();

            _filter = new ValidateModelAttribute();
        }

        private ActionExecutingContext GetActionExecutingContext()
        {
            var controllerMock = new Mock<Controller>();
            var dictionary = _actionArguments;
            var filter = new List<IFilterMetadata>();

            return new ActionExecutingContext(_actionContext.Object, filter, dictionary, controllerMock.Object);
        }

        private Mock<ActionContext> GetActionContext()
        {
            var contextMock = new Mock<HttpContext>();
            var routeMock = new Mock<RouteData>();
            var actionMock = new Mock<ActionDescriptor>();

            return new Mock<ActionContext>(contextMock.Object, routeMock.Object, actionMock.Object, _modelState);
        }

        [Fact]
        private void OnActionExecuting_OnNoModelErrorsAndNotNull_ResultIsNull()
        {
            _filter.OnActionExecuting(_actionExecutingContext);

            Assert.Null(_actionExecutingContext.Result);
        }

        [Fact]
        private void OnActionExecuting_OnModelErrors_ResultIs409()
        {
            string expectedErrorsResult = "error1, error2.";
            _modelState.AddModelError("", "error1");
            _modelState.AddModelError("", "error2");
            _actionContext = GetActionContext();
            _actionExecutingContext = GetActionExecutingContext();

            _filter.OnActionExecuting(_actionExecutingContext);
            IActionResult result = _actionExecutingContext.Result;
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private void OnActionExecuting_OnNullActionArguments_ResultIs400()
        {
            string expectedErrorsResult = "Bad request.";
            _actionArguments = new Dictionary<string, object>()
            {
                { "name", null }
            };
            _actionContext = GetActionContext();
            _actionExecutingContext = GetActionExecutingContext();

            _filter.OnActionExecuting(_actionExecutingContext);
            IActionResult result = _actionExecutingContext.Result;
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status400BadRequest, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
