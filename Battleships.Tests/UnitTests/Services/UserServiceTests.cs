using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<UserManager<AppUser>> _userManagerMock;
        private readonly Mock<SignInManager<AppUser>> _signInManagerMock;
        private readonly UserService _service;

        public UserServiceTests()
        {
            var storeMock = new Mock<IUserStore<AppUser>>();
            _userManagerMock = new Mock<UserManager<AppUser>>(storeMock.Object, null, null, null, null, null, null, null, null);
            _signInManagerMock = CreateSignInManagerMock();

            IList<string> roles = new List<string>() { "User", "Admin" };
            IQueryable<AppUser> users = new List<AppUser>()
            {
                new AppUser() { UserName = "foo0" },
                new AppUser() { UserName = "foo1" },
                new AppUser() { UserName = "foo2" }
            }.AsQueryable();

            _userManagerMock.SetupGet(mock => mock.Users).Returns(users);
            _userManagerMock.Setup(mock => mock.CheckPasswordAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(true);
            _userManagerMock.Setup(mock => mock.CheckPasswordAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(true);
            _userManagerMock.Setup(mock => mock.CreateAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            _userManagerMock.Setup(mock => mock.AddToRoleAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            _userManagerMock.Setup(mock => mock.ResetPasswordAsync(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            _userManagerMock.Setup(mock => mock.GeneratePasswordResetTokenAsync(It.IsAny<AppUser>())).ReturnsAsync("pass_reset_token");
            _userManagerMock.Setup(mock => mock.GetRolesAsync(It.IsAny<AppUser>())).ReturnsAsync(roles);
            _signInManagerMock.Setup(mock => mock.ConfigureExternalAuthenticationProperties(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(new AuthenticationProperties());
            _signInManagerMock.Setup(mock => mock.GetExternalLoginInfoAsync(It.IsAny<string>())).ReturnsAsync(new ExternalLoginInfo(new ClaimsPrincipal(), "Facebook", "some_providers_key", "user_name"));

            _service = new UserService(_userManagerMock.Object, _signInManagerMock.Object);
        }

        /// <summary>
        /// Creates and returns new Mock of AddToRoleAsync;
        /// </summary>
        /// <returns>Mock of AddToRoleAsync</returns>
        private Mock<SignInManager<AppUser>> CreateSignInManagerMock()
        {
            var userManagerMock = _userManagerMock;
            var contextAccessorMock = new Mock<IHttpContextAccessor>();
            var claimsFactoryMock = new Mock<IUserClaimsPrincipalFactory<AppUser>>();

            return new Mock<SignInManager<AppUser>>(userManagerMock.Object, contextAccessorMock.Object, claimsFactoryMock.Object, null, null, null);
        }

        [Fact]
        private async Task CreateNewUserAndAddToDbAsync_OnAllResultsSucceeded_ReturnsTrue()
        {
            bool result = await _service.CreateNewUserAndAddToDbAsync(new UserRegisterViewModel());

            Assert.True(result);
        }

        [Fact]
        private async Task CreateNewUserAndAddToDbAsync_OnCreateAsyncFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.CreateAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.CreateNewUserAndAddToDbAsync(new UserRegisterViewModel());

            Assert.False(result);
        }

        [Fact]
        private async Task CreateNewUserAndAddToDbAsync_OnAddToRoleAsyncFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.AddToRoleAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.CreateNewUserAndAddToDbAsync(new UserRegisterViewModel());

            Assert.False(result);
        }

        [Fact]
        private async Task CreateNewUserAndAddToDbAsync_OnUpdateAsyncThrowingException_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.UpdateAsync(It.IsAny<AppUser>())).ThrowsAsync(new Exception());

            bool result = await _service.CreateNewUserAndAddToDbAsync(new UserRegisterViewModel());

            Assert.False(result);
        }

        [Fact]
        private async Task ResetPassword_OnAllResultsSucceeded_ReturnsTrue()
        {
            bool result = await _service.ResetPassword(new AppUser(), "some_token", "some_password");

            Assert.True(result);
        }

        [Fact]
        private async Task ResetPassword_OnIdentityResultNotSucceeded_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.ResetPasswordAsync(It.IsAny<AppUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.ResetPassword(new AppUser(), "some_token", "some_password");

            Assert.False(result);
        }

        [Fact]
        private async Task ResetPassword_OnUpdateAsyncThrowingException_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.UpdateAsync(It.IsAny<AppUser>())).ThrowsAsync(new Exception());

            bool result = await _service.ResetPassword(new AppUser(), "some_token", "some_password");

            Assert.False(result);
        }
    }
}
