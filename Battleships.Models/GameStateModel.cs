using System.ComponentModel.DataAnnotations;

namespace Battleships.Models
{
    public class GameStateModel
    {
        public int GameId { get; set; }
        public int GameTurnNumber { get; set; }
        public int GameTurnPlayer { get; set; }
        public int FireRow { get; set; }
        public int FireCol { get; set; }
        public bool GameMulti { get; set; }
        public bool GameOpen { get; set; }
        public int GameSpeedDivider { get; set; }
        [Required(ErrorMessage = "Please fill up.")]
        public string GameDifficulty { get; set; }
        public bool DisplayingResults { get; set; }
        public bool FireResult { get; set; }
        public Player[] Players { get; set; }
        public bool IsDeploymentAllowed { get; set; }
        public bool IsStartAllowed { get; set; }

    }
}
