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
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IUserRepository> _repoMock;
        private readonly Mock<IInputSanitizer> _sanitizerMock;
        private readonly Mock<IEmailSender> _emailSenderMock;
        private readonly UserController _controller;
        private readonly PassResetEmailViewModel _properPassResetModel;
        private readonly ResetPasswordViewModel _properResetModel;
        private readonly UserRegisterViewModel _properRegisterUserModel;

        public UserControllerTests()
        {
            string properPassword = "proper_test_password";
            string properEmail = "proper_test_email@gmail.com";
            string properToken = "proper_test_token";
            string properName = "proper_test_name";

            _properPassResetModel = new PassResetEmailViewModel()
            {
                CaptchaToken = properToken,
                Email = properEmail
            };
            _properResetModel = new ResetPasswordViewModel()
            {
                Email = properEmail,
                Password = properPassword,
                Token = properToken
            };
            _properRegisterUserModel = new UserRegisterViewModel()
            {
                Email = properEmail,
                CaptchaToken = properToken,
                DisplayName = properName,
                Password = properPassword,
                UserName = properName
            };
            AppUser properUser = new AppUser()
            {
                Email = properEmail
            };

            _userServiceMock = new Mock<IUserService>();
            _sanitizerMock = new Mock<IInputSanitizer>();
            _emailSenderMock = new Mock<IEmailSender>();
            _repoMock = new Mock<IUserRepository>();

            _sanitizerMock.Setup(mock => mock.CleanUp(It.IsAny<string>())).Returns(It.IsAny<string>());
            _sanitizerMock.Setup(mock => mock.SanitizeRegisteringUserInputs(It.IsAny<UserRegisterViewModel>())).Returns(_properRegisterUserModel);
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync(properUser);
            _userServiceMock.Setup(mock => mock.GenerateUsername(It.IsAny<string>())).Returns(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.GetPassResetToken(It.IsAny<AppUser>())).ReturnsAsync(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.ResetPassword(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(true);
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);

            _controller = new UserController(_userServiceMock.Object, _sanitizerMock.Object, _emailSenderMock.Object, _repoMock.Object);
        }

        [Fact]
        private void PassChange_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properPassResetModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properPassResetModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        [Fact]
        private async Task PassChange_OnValidModel_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassChange(_properPassResetModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task PassChange_OnEmailSendingFailed_ReturnsStatusCode502()
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
        private void PassReset_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properResetModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properResetModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        [Fact]
        private async Task PassReset_OnValidModel_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassReset(_properResetModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task PassReset_OnPasswordUpdatingFailed_ReturnsStatusCode500()
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
        private void AddNewUser_OnValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properRegisterUserModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properRegisterUserModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        [Fact]
        private async Task AddNewUser_OnValidModel_ReturnsStatusCode200()
        {
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            IActionResult result = await _controller.AddNewUser(_properRegisterUserModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        [Fact]
        private async Task AddNewUser_OnExistingEmailFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Email already exists.";

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
