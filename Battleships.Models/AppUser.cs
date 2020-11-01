using Microsoft.AspNetCore.Identity;

namespace Battleships.Models
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }
        public int WonMultiplayerGames { get; set; }
        public int WonAiGames { get; set; }
    }
}
