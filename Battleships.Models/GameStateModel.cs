namespace Battleships.Models
{
    public class GameStateModel
    {
        public int GameId { get; set; }
        public int GameTurnNumber { get; set; }
        public int GameTurnPlayer { get; set; }
        public bool GameAi { get; set; }
        public bool GameMulti { get; set; }
        public bool GameOpen { get; set; }
        public bool GameLink { get; set; }
        public bool DisplayingResults { get; set; }
        public bool FireResult { get; set; }
        public Player[] Players { get; set; }
        public bool IsDeploymentAllowed { get; set; }
        public bool IsStartAllowed { get; set; }

    }
}
