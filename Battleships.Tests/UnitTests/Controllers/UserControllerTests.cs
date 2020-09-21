using Battleships.AppWeb.Controllers;
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

            _sanitizerMock.Setup(mock => mock.CleanUp(It.IsAny<string>())).Returns(It.IsAny<string>());
            _sanitizerMock.Setup(mock => mock.SanitizeRegisteringUserInputs(It.IsAny<UserRegisterViewModel>())).Returns(_properRegisterUserModel);
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync(properUser);
            _userServiceMock.Setup(mock => mock.GenerateUsername(It.IsAny<string>())).Returns(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.GetPassResetToken(It.IsAny<AppUser>())).ReturnsAsync(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.ResetPassword(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);
            _userServiceMock.Setup(mock => mock.CreateNewUserAndAddToDbAsync(It.IsAny<UserRegisterViewModel>())).ReturnsAsync(true);
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);

            _controller = new UserController(_userServiceMock.Object, _sanitizerMock.Object, _emailSenderMock.Object);
        }

        /// <summary>
        /// Verifying that model for PassChange is valideted correctly.
        /// NOTE: Just for reference that _properPassResetModel is correct.
        /// </summary>
        [Fact]
        private void PassChange_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properPassResetModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properPassResetModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        /// <summary>
        /// Verifying that with _properPassResetModel there is correct data flow and should be returned 200 status code.
        /// </summary>
        [Fact]
        private async Task PassChange_WithValidModel_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassChange(_properPassResetModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        /// <summary>
        /// Verifying that with failed model validation will be returned 409 status code and listed model errors.
        /// </summary>
        [Fact]
        private async Task PassChange_ModelValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1"); //model validation error will be thrown
            _controller.ModelState.AddModelError("test_error_2", "err2"); //model validation error will be thrown
            IActionResult result = await _controller.PassChange(new PassResetEmailViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that failed email sending will return 502 status code and error value.
        /// </summary>
        [Fact]
        private async Task PassChange_WhenEmailSendingFailed_ReturnsStatusCode502()
        {
            string expectedErrorsResult = "Email could not be sent.";
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.PassChange(_properPassResetModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status502BadGateway, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that model for PassReset is valideted correctly.
        /// NOTE: Just for reference that _properResetModel is correct.
        /// </summary>
        [Fact]
        private void PassReset_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properResetModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properResetModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        /// <summary>
        /// Verifying that with _properResetModel there is correct data flow and should be returned 200 status code.
        /// </summary>
        [Fact]
        private async Task PassReset_WithValidModel_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassReset(_properResetModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        /// <summary>
        /// Verifying that with failed model validation will be returned 409 status code and listed model errors.
        /// </summary>
        [Fact]
        private async Task PassReset_ModelValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1"); //model validation error will be thrown
            _controller.ModelState.AddModelError("test_error_2", "err2"); //model validation error will be thrown
            IActionResult result = await _controller.PassReset(new ResetPasswordViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that failed password updating will return 502 status code and error value.
        /// </summary>
        [Fact]
        private async Task PassReset_WhenPasswordUpdatingFailed_ReturnsStatusCode500()
        {
            string expectedErrorsResult = "Error when updating password.";
            _userServiceMock.Setup(mock => mock.ResetPassword(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.PassReset(_properResetModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that model for AddNewUser is valideted correctly.
        /// NOTE: Just for reference that _registerUserModel is correct.
        /// </summary>
        [Fact]
        private void AddNewUser_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properRegisterUserModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properRegisterUserModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        /// <summary>
        /// Verifying that with _registerUserModel there is correct data flow and should be returned 200 status code.
        /// </summary>
        [Fact]
        private async Task AddNewUser_WithValidModel_ReturnsStatusCode200()
        {
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync((AppUser)null);
            IActionResult result = await _controller.AddNewUser(_properRegisterUserModel);
            StatusCodeResult statusCode = result as StatusCodeResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status200OK, statusCode.StatusCode);
        }

        /// <summary>
        /// Verifying that with failed model validation will be returned 409 status code and listed model errors.
        /// </summary>
        [Fact]
        private async Task AddNewUser_ModelValidationFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "err1, err2.";

            _controller.ModelState.AddModelError("test_error_1", "err1"); //model validation error will be thrown
            _controller.ModelState.AddModelError("test_error_2", "err2"); //model validation error will be thrown
            IActionResult result = await _controller.AddNewUser(new UserRegisterViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status422UnprocessableEntity, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that existing users email will return 409 status code and error value.
        /// </summary>
        [Fact]
        private async Task AddNewUser_WhenExistingEmailFailed_ReturnsStatusCode409()
        {
            string expectedErrorsResult = "Email already exists.";

            IActionResult result = await _controller.AddNewUser(_properRegisterUserModel);
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that failing of creating new user will return 500 status code and error value.
        /// </summary>
        [Fact]
        private async Task AddNewUser_WhenCreatingUserFailed_ReturnsStatusCode500()
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
