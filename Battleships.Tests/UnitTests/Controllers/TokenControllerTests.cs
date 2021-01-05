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
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Controllers
{
    public class TokenControllerTests
    {
        private readonly string _properEmail = "proper_test_email@gmail.com";
        private readonly string _wrongEmail = "wrong_test_email@gmail.com";
        private readonly string _properPassword = "proper_test_password";
        private readonly string _properToken = "proper_test_token";
        private readonly string _properName = "proper_test_name";
        private readonly Mock<ITokenService> _tokenServiceMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly TokenController _controller;
        private readonly TokenRequestViewModel _properTokenRequestModel;
        private readonly RefreshTokenRequestViewModel _properRefreshTokenModel;
        private readonly RevokeTokenRequestViewModel _properRevokeTokenModel;
        private readonly TokenResponseViewModel _returnedResponseTokenModel;
        private readonly ExternalLoginInfo _externalLoginInfoInstance;
        private readonly AppUser _properUser;

        public TokenControllerTests()
        {
            Thread.CurrentPrincipal = new TestPrincipalWrapper(new Claim(ClaimTypes.Email, _properEmail));

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
                UserName = _properName,
                Token = _properToken,
                RefreshToken = _properToken
            };
            _properRefreshTokenModel = new RefreshTokenRequestViewModel()
            {
                Email = _properEmail,
                RefreshToken = _properToken
            };
            _properTokenRequestModel = new TokenRequestViewModel()
            {
                Email = _properEmail,
                Password = _properPassword,
            };
            _properUser = new AppUser() { Email = _properEmail };
            DefaultHttpContext httpContext = new DefaultHttpContext();
            TempDataDictionary tempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>())
            {
                { "requestIp", "127.0.0.1" }
            };

            _tokenServiceMock = new Mock<ITokenService>();
            _userServiceMock = new Mock<IUserService>();

            _userServiceMock.Setup(mock => mock.GetIpAddress(It.IsAny<DefaultHttpContext>())).Returns("127.0.0.1");
            _userServiceMock.Setup(mock => mock.FindUserByEmail(_properEmail)).ReturnsAsync(_properUser);
            _userServiceMock.Setup(mock => mock.FindUserByEmail(_wrongEmail)).ReturnsAsync((AppUser)null);
            _userServiceMock.Setup(mock => mock.VerifyUsersPassword(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(true);
            _userServiceMock.Setup(mock => mock.GetUserRoleAsync(It.IsAny<AppUser>())).ReturnsAsync("User");
            _userServiceMock.Setup(mock => mock.GetExternalLogin()).ReturnsAsync(_externalLoginInfoInstance);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(true);
            _tokenServiceMock.Setup(mock => mock.GenerateTokenResponse(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).Returns(_returnedResponseTokenModel);
            _tokenServiceMock.Setup(mock => mock.VerifyRefreshToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);
            _tokenServiceMock.Setup(mock => mock.RevokeTokens(_properRevokeTokenModel)).Returns(true);

            _controller = new TokenController(_tokenServiceMock.Object, _userServiceMock.Object) { TempData = tempData };
        }

        //JsonWebToken

        [Fact]
        private async Task JsonWebToken_OnUserExistingAndCorrectPassword_ReturnsJsonResult()
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
        private async Task JsonWebToken_OnUserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            TokenRequestViewModel model = new TokenRequestViewModel() { Email = _wrongEmail, Password = _properPassword };

            IActionResult result = await _controller.JsonWebToken(model);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task JsonWebToken_OnWrongUserPassword_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.VerifyUsersPassword(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //RefreshToken

        [Fact]
        private async Task RefreshToken_OnUserExistingAndTokenPositiveVerification_ReturnsJsonResult()
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
            RefreshTokenRequestViewModel model = new RefreshTokenRequestViewModel() { Email = _wrongEmail, RefreshToken = _properToken };

            IActionResult result = await _controller.RefreshToken(model);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task RefreshToken_OnTokenNegativeVerification_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Please log in again.";
            _tokenServiceMock.Setup(mock => mock.VerifyRefreshToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(false);

            IActionResult result = await _controller.RefreshToken(new RefreshTokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //RevokeToken

        [Fact]
        private void RevokeToken_OnRevokingTokenPassed_Returns200StatusCode()
        {
            IActionResult result = _controller.RevokeToken(_properRevokeTokenModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private void RevokeToken_OnRevokingTokensFailed_Returns500StatusCode()
        {
            string expectedErrorsResult = "There was a problem logging the user out correctly.";
            _tokenServiceMock.Setup(mock => mock.RevokeTokens(_properRevokeTokenModel)).Returns(false);

            IActionResult result = _controller.RevokeToken(_properRevokeTokenModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //ExternalLoginCallback

        [Fact]
        private async Task ExternalLoginCallback_OnNoRemoteErrorAndInfoReceivedAndUserExisting_ReturnsViewResultWithObject()
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
        private async Task ExternalLoginCallback_OnUserNotExistingAndCouldNotCreateNewUser_ReturnsStatusCode500()
        {
            string expectedErrorsResult = "Error when creating new user.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(false);
            UserRegisterViewModel model = new UserRegisterViewModel() { Email = _wrongEmail };
            _userServiceMock.Setup(mock => mock.GetRegisterModel(It.IsAny<ExternalLoginInfo>())).Returns(model);

            IActionResult result = await _controller.ExternalLoginCallback(null);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task ExternalLoginCallback_OnUserNotExistingAndCouldCreateNewUser_ReturnsViewResultWithObject()
        {
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(true);
            UserRegisterViewModel model = new UserRegisterViewModel() { Email = _properEmail };
            _userServiceMock.Setup(mock => mock.GetRegisterModel(It.IsAny<ExternalLoginInfo>())).Returns(model);

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
    }
}
