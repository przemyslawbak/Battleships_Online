using System;
using System.ComponentModel.DataAnnotations;

namespace Battleships.Models
{
    public class BlacklistedToken
    {
        [Key]
        public int Id { get; set; }
        public string Token { get; set; }
        public DateTime BlacklistedDateTime { get; set; }
    }
}
