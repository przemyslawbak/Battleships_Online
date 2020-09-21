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
        PassResetEmailViewModel _properModel;
        string _properEmail;
        string _properCaptchaToken;
        AppUser _properUser;

        public UserControllerTests()
        {
            _properEmail = "proper_test_email@gmail.com";
            _properCaptchaToken = "proper_test_captcha_token";
            _properModel = new PassResetEmailViewModel()
            {
                CaptchaToken = _properCaptchaToken,
                Email = _properEmail
            };
            _properUser = new AppUser()
            {
                Email = _properEmail
            };

            _userServiceMock = new Mock<IUserService>();
            _sanitizerMock = new Mock<IInputSanitizer>();
            _emailSenderMock = new Mock<IEmailSender>();

            _sanitizerMock.Setup(mock => mock.CleanUp(It.IsAny<string>())).Returns(It.IsAny<string>());
            _userServiceMock.Setup(mock => mock.FindUserByEmail(It.IsAny<string>())).ReturnsAsync(_properUser);
            _userServiceMock.Setup(mock => mock.GetPassResetToken(It.IsAny<AppUser>())).ReturnsAsync(It.IsAny<string>());
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);

            _controller = new UserController(_userServiceMock.Object, _sanitizerMock.Object, _emailSenderMock.Object);
        }

        /// <summary>
        /// Verifying that model is valideted correctly.
        /// NOTE: Just for reference that _properModel is correct.
        /// </summary>
        [Fact]
        private void PassChange_ValidationOfValidModelIsCorrect()
        {
            ValidationContext context = new ValidationContext(_properModel, null, null);
            List<ValidationResult> results = new List<ValidationResult>();
            bool isModelStateValid = Validator.TryValidateObject(_properModel, context, results, true);

            Assert.True(isModelStateValid);
        }

        /// <summary>
        /// Verifying that with _properModel there is correct data flow and should be returned 200 status code.
        /// </summary>
        [Fact]
        private async Task PassChange_WithValidModel_ReturnsStatusCode200()
        {
            IActionResult result = await _controller.PassChange(_properModel);
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
            string expectedErrorsResult = "err1,err2";

            _controller.ModelState.AddModelError("test_error_1", "err1"); //model validation error will be thrown
            _controller.ModelState.AddModelError("test_error_2", "err2"); //model validation error will be thrown
            IActionResult result = await _controller.PassChange(new PassResetEmailViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }

        /// <summary>
        /// Verifying that email sending will return 502 status code and correct error value.
        /// </summary>
        [Fact]
        private async Task PassChange_WhenEmailSendingFailed_ReturnsStatusCode502()
        {
            string expectedErrorsResult = "Email could not be sent.";
            _emailSenderMock.Setup(mock => mock.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(false);

            IActionResult result = await _controller.PassChange(new PassResetEmailViewModel());
            ObjectResult objectResult = result as ObjectResult;

            Assert.NotNull(result);
            Assert.Equal(StatusCodes.Status502BadGateway, objectResult.StatusCode);
            Assert.Equal(expectedErrorsResult, objectResult.Value);
        }
    }
}
