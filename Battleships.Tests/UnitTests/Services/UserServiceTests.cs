using Battleships.DAL;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class UserServiceTests
    {
        private readonly string _properName = "proper_test_name";
        private readonly string _wrongName = "wrong_test_name";
        private readonly string _properEmail = "proper_test_email@gmail.com";
        private readonly Mock<UserManager<AppUser>> _userManagerMock;
        private readonly Mock<SignInManager<AppUser>> _signInManagerMock;
        private readonly Mock<IUserRepository> _userRepo;
        private readonly UserService _service;
        private readonly AppUser _properUser;

        public UserServiceTests()
        {
            _userRepo = new Mock<IUserRepository>();
            Mock<IUserStore<AppUser>> storeMock = new Mock<IUserStore<AppUser>>();
            _userManagerMock = new Mock<UserManager<AppUser>>(storeMock.Object, null, null, null, null, null, null, null, null);
            _signInManagerMock = CreateSignInManagerMock();

            IList<string> roles = new List<string>() { "User", "Admin" };
            IQueryable<AppUser> users = new List<AppUser>()
            {
                new AppUser() { UserName = "foo0" },
                new AppUser() { UserName = "foo1" },
                new AppUser() { UserName = "foo2" }
            }.AsQueryable();
            _properUser = new AppUser() { Email = _properEmail };

            _userManagerMock.Setup(mock => mock.FindByNameAsync(It.IsAny<string>())).ReturnsAsync(_properUser);
            _userManagerMock.Setup(mock => mock.FindByNameAsync(_wrongName)).ReturnsAsync((AppUser)null);
            _userManagerMock.Setup(mock => mock.UpdateAsync(It.IsAny<AppUser>())).ReturnsAsync(IdentityResult.Success);
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

            _service = new UserService(_userManagerMock.Object, _signInManagerMock.Object, _userRepo.Object);
        }

        private Mock<SignInManager<AppUser>> CreateSignInManagerMock()
        {
            var userManagerMock = _userManagerMock;
            var contextAccessorMock = new Mock<IHttpContextAccessor>();
            var claimsFactoryMock = new Mock<IUserClaimsPrincipalFactory<AppUser>>();

            return new Mock<SignInManager<AppUser>>(userManagerMock.Object, contextAccessorMock.Object, claimsFactoryMock.Object, null, null, null);
        }

        //UpdateUser

        [Fact]
        private async Task UpdateUser_OnUserExistingAndUpdateSucceeses_ReturnsTrue()
        {
            EditUserViewModel model = new EditUserViewModel() { UserName = _properName };

            bool result = await _service.UpdateUser(model);

            Assert.True(result);
        }

        [Fact]
        private async Task UpdateUser_OnUpdateAsyncFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.UpdateAsync(It.IsAny<AppUser>())).ReturnsAsync(new IdentityResult());
            EditUserViewModel model = new EditUserViewModel() { UserName = _properName };

            bool result = await _service.UpdateUser(model);

            Assert.False(result);
        }

        [Fact]
        private async Task UpdateUser_OnUserNotExisting_ReturnsFalse()
        {
            EditUserViewModel model = new EditUserViewModel() { UserName = _wrongName };

            bool result = await _service.UpdateUser(model);

            Assert.False(result);
        }

        //CreateNewUser

        [Fact]
        private async Task CreateUserAsync_OnAllResultsSucceeded_ReturnsTrue()
        {
            bool result = await _service.CreateUserAsync(new UserRegisterViewModel());

            Assert.True(result);
        }

        [Fact]
        private async Task CreateUserAsync_OnCreateAsyncFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.CreateAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.CreateUserAsync(new UserRegisterViewModel());

            Assert.False(result);
        }

        [Fact]
        private async Task CreateUserAsync_OnAddToRoleAsyncFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.AddToRoleAsync(It.IsAny<AppUser>(), It.IsAny<string>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.CreateUserAsync(new UserRegisterViewModel());

            Assert.False(result);
        }

        [Fact]
        private async Task CreateUserAsync_OnUserUpdateFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.UpdateAsync(It.IsAny<AppUser>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.CreateUserAsync(new UserRegisterViewModel());

            Assert.False(result);
        }

        //ResetPassword

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
        private async Task ResetPassword_OnUserUpdateFailed_ReturnsFalse()
        {
            _userManagerMock.Setup(mock => mock.UpdateAsync(It.IsAny<AppUser>())).ReturnsAsync(new IdentityResult());

            bool result = await _service.ResetPassword(new AppUser(), "some_token", "some_password");

            Assert.False(result);
        }
    }
}
