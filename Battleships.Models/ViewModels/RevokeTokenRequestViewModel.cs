namespace Battleships.Models.ViewModels
{
    public class RevokeTokenRequestViewModel
    {
        public string username { get; set; }
        public string refreshtoken { get; set; }
        public string token { get; set; }
    }
}
