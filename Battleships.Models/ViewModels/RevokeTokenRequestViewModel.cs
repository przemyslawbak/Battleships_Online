namespace Battleships.Models.ViewModels
{
    public class RevokeTokenRequestViewModel
    {
        public string UserName { get; set; }
        public string RefreshToken { get; set; }
        public string Token { get; set; }
    }
}
