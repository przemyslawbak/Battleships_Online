using Battleships.AppWeb.Controllers;
using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Controllers
{
    public class UserControllerTests
    {
        private readonly string _properEmail = "proper_test_email@gmail.com";
        private readonly string _wrongEmail = "wrong_test_email@gmail.com";
        private readonly string _properPassword = "proper_test_password";
        private readonly string _properToken = "proper_test_token";
        private readonly string _properName = "proper_test_name";
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IEmailSender> _emailSenderMock;
        private readonly UserController _controller;
        private readonly PassResetEmailViewModel _properPassResetModel;
        private readonly ResetPasswordViewModel _properResetModel;
        private readonly UserRegisterViewModel _properRegisterUserModel;
        private readonly AppUser _properUser;

        public UserControllerTests()
        {
            _properPassResetModel = new PassResetEmailViewModel()
            {
                CaptchaToken = _properToken,
                Email = _properEmail
            };
            _properResetModel = new ResetPasswordViewModel()
            {
                Email = _properEmail,
                Password = _properPassword,
                Token = _properToken
            };
            _properRegisterUserModel = new UserRegisterViewModel()
            {
                Email = _properEmail,
                CaptchaToken = _properToken,
                DisplayName = _properName,
                Password = _properPassword,
                UserName = _properName
            };
            _properUser = new AppUser() { Email = _properEmail };

            _userServiceMock = new Mock<IUserService>();
            _emailSenderMock = new Mock<IEmailSender>();

            _userServiceMock.Setup(mock => mock.FindUserByEmail(_properEmail)).ReturnsAsync(_properUser);
            _userServiceMock.Setup(mock => mock.FindUserByEmail(_wrongEmail)).ReturnsAsync((AppUser)null);
            _userServiceMock.Setup(mock => mock.GenerateUsername(It.IsAny<string>())).Returns(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.GetPassResetToken(It.IsAny<AppUser>())).ReturnsAsync(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.ResetPassword(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(true);
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);

            _controller = new UserController(_userServiceMock.Object, _emailSenderMock.Object);
        }

        //PostWinner

        [Fact]
        private void PostWinner_OnAddWonGameCorrectly_ReturnsStatusCode200()
        {
            _userServiceMock.Setup(mock => mock.AddWonGame(It.IsAny<GameWinner>())).Returns(true);

            IActionResult result = _controller.PostWinner(new GameWinner());
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private void PostWinner_OnAddWonGameFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Error when saving winner.";
            _userServiceMock.Setup(mock => mock.AddWonGame(It.IsAny<GameWinner>())).Returns(false);

            IActionResult result = _controller.PostWinner(new GameWinner());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //EditUser

        [Fact]
        private async Task PostWinner_OnUpdateUserCorrectly_ReturnsStatusCode200()
        {
            _userServiceMock.Setup(mock => mock.UpdateUser(It.IsAny<EditUserViewModel>())).ReturnsAsync(true);

            IActionResult result = await _controller.EditUser(new EditUserViewModel());
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task PostWinner_OnUpdateUserFailed_ReturnsStatusCode500()
        {
            string expectedErrorsResult = "Error when updating user.";
            _userServiceMock.Setup(mock => mock.UpdateUser(It.IsAny<EditUserViewModel>())).ReturnsAsync(false);

            IActionResult result = await _controller.EditUser(new EditUserViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //PassChange

        [Fact]
        private async Task PassChange_OnUserExistingAndSendEmailAsyncCorrect_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassChange(_properPassResetModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task PassChange_OnSendEmailAsyncFailed_ReturnsStatusCode502()
        {
            string expectedErrorsResult = "Email could not be sent.";
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.PassChange(_properPassResetModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status502BadGateway, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task PassChange_OnUserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            PassResetEmailViewModel model = new PassResetEmailViewModel() { Email = _wrongEmail };

            IActionResult result = await _controller.PassChange(model);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //PassReset

        [Fact]
        private async Task PassReset_OnUserExistingAndPasswordResetCorrectly_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassReset(_properResetModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task PassReset_OnPasswordResettingFailed_ReturnsStatusCode500()
        {
            string expectedErrorsResult = "Error when updating password.";
            _userServiceMock.Setup(mock => mock.ResetPassword(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.PassReset(_properResetModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task PassReset_OnUserNotExisting_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";
            ResetPasswordViewModel model = new ResetPasswordViewModel() { Email = _wrongEmail };

            IActionResult result = await _controller.PassReset(model);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        //AddNewUser

        [Fact]
        private async Task AddNewUser_OnUserNotExistingYetAndCreatedUserCorrectly_ReturnsStatusCode200()
        {
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            IActionResult result = await _controller.AddNewUser(_properRegisterUserModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task AddNewUser_OnExistingUser_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Invalid user details.";

            IActionResult result = await _controller.AddNewUser(_properRegisterUserModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        [Fact]
        private async Task AddNewUser_OnCreatingUserFailed_ReturnsStatusCode500()
        {
            string expectedErrorsResult = "Error when creating new user.";
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(false);

            IActionResult result = await _controller.AddNewUser(_properRegisterUserModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
