using Battleships.AppWeb.Controllers;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Battleships.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Moq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Controllers
{
    public class TokenControllerTests
    {
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly TokenController _controller;
        private readonly TokenRequestViewModel _properTokenRequestModel;
        private readonly RefreshTokenRequestViewModel _properRefreshTokenModel;
        private readonly RevokeTokenRequestViewModel _properRevokeTokenModel;
        private readonly TokenResponseViewModel _returnedResponseTokenModel;
        private readonly ExternalLoginInfo _externalLoginInfoInstance;

        public TokenControllerTests()
        {
            string properClientId = "proper_test_client_id";
            string properClientSecret = "proper_test_client_id";
            string properEmail = "proper_test_email@gmail.com";
            string grantType = "password";
            string properPassword = "proper_test_password";
            string properToken = "proper_test_token";
            string properName = "proper_test_name";
            Thread.CurrentPrincipal = new TestPrincipalWrapper(new Claim(ClaimTypes.Email, properEmail));

            _externalLoginInfoInstance = new ExternalLoginInfo((ClaimsPrincipal)Thread.CurrentPrincipal, "Facebook", "providers_key", "some_display_name");
            _returnedResponseTokenModel = new TokenResponseViewModel()
            {
                DisplayName = "foo1",
                Email = "foo2",
                RefreshToken = "foo3",
                Role = "foo4",
                Token = "foo5",
                User = "foo6"
            };
            _properRevokeTokenModel = new RevokeTokenRequestViewModel()
            {
                UserName = properName,
                Token = properToken,
                RefreshToken = properToken
            };
            _properRefreshTokenModel = new RefreshTokenRequestViewModel()
            {
                Email = properEmail,
                RefreshToken = properToken
            };
            _properTokenRequestModel = new TokenRequestViewModel()
            {
                ClientId = properClientId,
                ClientSecret = properClientSecret,
                Email = properEmail,
                GrantType = grantType,
                Password = properPassword,
            };
            AppUser properUser = new AppUser()
            {
                Email = properEmail
            };
            DefaultHttpContext httpContext = new DefaultHttpContext();
            TempDataDictionary tempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>())
            {
                { "requestIp", "127.0.0.1" }
            };

            _tokenServiceMock = new Mock<ITokenService>();
            _userServiceMock = new Mock<IUserService>();

            _userServiceMock.Setup(mock => mock.GetIpAddress(It.IsAny<DefaultHttpContext>())).Returns("127.0.0.1");
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync(properUser);
            _userServiceMock.Setup(mock => mock.VerifyUsersPassword(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(true);
            _userServiceMock.Setup(mock => mock.GetUserRoleAsync(It.IsAny<AppUser>())).ReturnsAsync("User");
            _userServiceMock.Setup(mock => mock.GetExternalLogin()).ReturnsAsync(_externalLoginInfoInstance);
            _userServiceMock.Setup(mock => mock.GetRegisterModel(It.IsAny<ExternalLoginInfo>())).Returns(new UserRegisterViewModel());
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(true);
            _tokenServiceMock.Setup(mock => mock.GenerateTokenResponse(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).Returns(_returnedResponseTokenModel);
            _tokenServiceMock.Setup(mock => mock.VerifyRefreshToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);
            _tokenServiceMock.Setup(mock => mock.RevokeTokens(_properRevokeTokenModel)).Returns(true);

            _controller = new TokenController(_tokenServiceMock.Object, _userServiceMock.Object) { TempData = tempData };
        }

        [Fact]
        private void JsonWebToken_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properTokenRequestModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properTokenRequestModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        [Fact]
        private async Task JsonWebToken_OnValidModel_ReturnsJsonResult()
        {
            IActionResult result = await _controller.JsonWebToken(_properTokenRequestModel);
            JsonResult resultObject = result as JsonResult;
            dynamic resultData = new JsonResultDynamicWrapper(resultObject);

            Assert.NotNull(result);
            Assert.IsType<JsonResult>(result);
            Assert.Equal("foo1", resultData.DisplayName);
            Assert.Equal("foo2", resultData.Email);
            Assert.Equal("foo3", resultData.RefreshToken);
            Assert.Equal("foo4", resultData.Role);
            Assert.Equal("foo5", resultData.Token);
            Assert.Equal("foo6", resultData.User);
        }

        [Fact]
        private async Task JsonWebToken_OnValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1");
            _controller.ModelState.AddModelError("test_error_2", "err2");
            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task JsonWebToken_OnUserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);

            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task JsonWebToken_OnWrongUserPass_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.VerifyUsersPassword(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private void RefreshToken_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properRefreshTokenModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properRefreshTokenModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        [Fact]
        private async Task RefreshToken_OnModelValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1");
            _controller.ModelState.AddModelError("test_error_2", "err2");
            IActionResult result = await _controller.RefreshToken(new RefreshTokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task RefreshToken_OnValidModel_ReturnsJsonResult()
        {
            IActionResult result = await _controller.RefreshToken(_properRefreshTokenModel);
            JsonResult resultObject = result as JsonResult;
            dynamic resultData = new JsonResultDynamicWrapper(resultObject);

            Assert.NotNull(result);
            Assert.IsType<JsonResult>(result);
            Assert.Equal("foo1", resultData.DisplayName);
            Assert.Equal("foo2", resultData.Email);
            Assert.Equal("foo3", resultData.RefreshToken);
            Assert.Equal("foo4", resultData.Role);
            Assert.Equal("foo5", resultData.Token);
            Assert.Equal("foo6", resultData.User);
        }

        [Fact]
        private async Task RefreshToken_OnUserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);

            IActionResult result = await _controller.RefreshToken(new RefreshTokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private void RevokeToken_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properRevokeTokenModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properRevokeTokenModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        [Fact]
        private void RevokeToken_OnModelValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1");
            _controller.ModelState.AddModelError("test_error_2", "err2");
            IActionResult result = _controller.RevokeToken(new RevokeTokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private void RevokeToken_OnValidModel_Returns200StatusCode()
        {
            IActionResult result = _controller.RevokeToken(_properRevokeTokenModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private void RevokeToken_OnRevokingTokensFailed_Returns500StatusCode()
        {
            _tokenServiceMock.Setup(mock => mock.RevokeTokens(_properRevokeTokenModel)).Returns(false);

            IActionResult result = _controller.RevokeToken(_properRevokeTokenModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
        }

        [Fact]
        private async Task ExternalLoginCallback_OnWithCorrectValuesReturned_ReturnsJsonResult()
        {
            IActionResult result = await _controller.ExternalLoginCallback(null);
            ViewResult resultObject = result as ViewResult;
            TokenResponseViewModel resultData = resultObject.ViewData.Model as TokenResponseViewModel;

            Assert.NotNull(result);
            Assert.IsType<ViewResult>(result);
            Assert.Equal("foo1", resultData.DisplayName);
            Assert.Equal("foo2", resultData.Email);
            Assert.Equal("foo3", resultData.RefreshToken);
            Assert.Equal("foo4", resultData.Role);
            Assert.Equal("foo5", resultData.Token);
            Assert.Equal("foo6", resultData.User);
        }

        [Fact]
        private async Task ExternalLoginCallback_OnProvidersRemoteError_ReturnsStatusCode503()
        {
            string expectedErrorsResult = "External provider error: some_error.";

            IActionResult result = await _controller.ExternalLoginCallback("some_error");
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status503ServiceUnavailable, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task ExternalLoginCallback_OnExternalLoginInfoNotReceived_ReturnsStatusCode503()
        {
            string expectedErrorsResult = "External provider error.";
            _userServiceMock.Setup(mock => mock.GetExternalLogin()).ReturnsAsync((ExternalLoginInfo)null);

            IActionResult result = await _controller.ExternalLoginCallback(null);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status503ServiceUnavailable, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task ExternalLoginCallback_OnUserNotFoundAndCouldNotCreateNewUser_ReturnsStatusCode500()
        {
            string expectedErrorsResult = "Error when creating new user.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(false);

            IActionResult result = await _controller.ExternalLoginCallback(null);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
