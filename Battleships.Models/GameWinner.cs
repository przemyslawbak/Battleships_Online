using System.ComponentModel.DataAnnotations;

namespace Battleships.Models
{
    public class GameWinner
    {
        [Required(ErrorMessage = "Please fill up.")]
        public string UserName { get; set; }
        public bool Multiplayer { get; set; }
    }
}
