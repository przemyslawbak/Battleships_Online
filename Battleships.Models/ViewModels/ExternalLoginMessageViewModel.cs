namespace Battleships.Models.ViewModels
{
    public class ExternalLoginMessageViewModel
    {
        public string AccessToken { get; set; }
        public string Platform { get; set; }
        public string Error { get; set; }
        public string ErrorDescription { get; set; }
    }
}
