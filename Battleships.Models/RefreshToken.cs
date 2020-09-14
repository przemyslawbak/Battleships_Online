using System.ComponentModel.DataAnnotations;

namespace Battleships.Models
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public string IpAddress { get; set; }
    }
}
