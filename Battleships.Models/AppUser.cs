using Microsoft.AspNetCore.Identity;

namespace Battleships.Models
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }
    }
}
