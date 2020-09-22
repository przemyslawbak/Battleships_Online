﻿using Battleships.AppWeb.Controllers;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Battleships.Tests.Wrappers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Moq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        private readonly TokenResponseViewModel _returnedResponseTokenModel;

        public TokenControllerTests()
        {
            string properClientId = "proper_test_client_id";
            string properClientSecret = "proper_test_client_id";
            string properEmail = "proper_test_email@gmail.com";
            string grantType = "password";
            string properPassword = "proper_test_password";
            string properToken = "proper_test_token";

            _returnedResponseTokenModel = new TokenResponseViewModel()
            {
                DisplayName = "foo1",
                Email = "foo2",
                RefreshToken = "foo3",
                Role = "foo4",
                Token = "foo5",
                User = "foo6"
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
            TempDataDictionary tempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>());
            tempData.Add("requestIp", "127.0.0.1");

            _tokenServiceMock = new Mock<ITokenService>();
            _userServiceMock = new Mock<IUserService>();

            _userServiceMock.Setup(mock => mock.GetIpAddress(It.IsAny<DefaultHttpContext>())).Returns("127.0.0.1");
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync(properUser);
            _userServiceMock.Setup(mock => mock.VerifyUsersPassword(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(true);
            _userServiceMock.Setup(mock => mock.GetUserRoleAsync(It.IsAny<AppUser>())).ReturnsAsync("User");
            _tokenServiceMock.Setup(mock => mock.GenerateTokenResponse(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).Returns(_returnedResponseTokenModel);
            _tokenServiceMock.Setup(mock => mock.VerifyRefreshToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);

            _controller = new TokenController(_tokenServiceMock.Object, _userServiceMock.Object) { TempData = tempData };
        }

        /// <summary>
        /// Verifying that model for JsonWebToken is valideted correctly.
        /// NOTE: Just for reference that _properTokenRequestModel is correct.
        /// </summary>
        [Fact]
        private void JsonWebToken_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properTokenRequestModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properTokenRequestModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        /// <summary>
        /// Verifying that with _properTokenRequestModel there is correct data flow and should be returned JsonResult with proper model object.
        /// </summary>
        [Fact]
        private async Task JsonWebToken_WithValidModel_ReturnsJsonResult()
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

        /// <summary>
        /// Verifying that with failed model validation will be returned 409 status code and listed model errors.
        /// </summary>
        [Fact]
        private async Task JsonWebToken_ModelValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1"); //model validation error will be thrown
            _controller.ModelState.AddModelError("test_error_2", "err2"); //model validation error will be thrown
            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that with user not existing will be returned 409 status code.
        /// </summary>
        [Fact]
        private async Task JsonWebToken_UserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);

            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that with wrong password will be returned 409 status code.
        /// </summary>
        [Fact]
        private async Task JsonWebToken_WithWrongUserPass_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.VerifyUsersPassword(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.JsonWebToken(new TokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that model for RefreshToken is valideted correctly.
        /// NOTE: Just for reference that _properRefreshTokenModel is correct.
        /// </summary>
        [Fact]
        private void RefreshToken_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properRefreshTokenModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properRefreshTokenModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        /// <summary>
        /// Verifying that with _properRefreshTokenModel there is correct data flow and should be returned JsonResult with proper model object.
        /// </summary>
        [Fact]
        private async Task RefreshToken_WithValidModel_ReturnsJsonResult()
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

        /// <summary>
        /// Verifying that with user not existing will be returned 409 status code.
        /// </summary>
        [Fact]
        private async Task RefreshToken_UserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);

            IActionResult result = await _controller.RefreshToken(new RefreshTokenRequestViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
