using System.Security.Claims;

namespace Battleships.Tests.Helpers
{
    public class TestPrincipalWrapper : ClaimsPrincipal
    {
        public TestPrincipalWrapper(params Claim[] claims) : base(new TestIdentity(claims))
        {
        }
    }

    public class TestIdentity : ClaimsIdentity
    {
        public TestIdentity(params Claim[] claims) : base(claims)
        {
        }
    }
}
