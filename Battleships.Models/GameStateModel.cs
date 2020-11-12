using System.Numerics;

namespace Battleships.Models
{
    public enum GameStage
    {
        Deploying,
        Playing
    }

    public enum WhoseTurn
    {
        Player1,
        Player2
    }

    public class GameStateModel
    {
        public int GameId { get; set; }
        public int GameTurnNumber { get; set; }
        public bool GameAi { get; set; }
        public bool GameMulti { get; set; }
        public bool GameOpen { get; set; }
        public bool GameLink { get; set; }
        public GameStage GameStage { get; set; }
        public WhoseTurn WhoseTurn { get; set; }
        public bool[][] Player1Fleet { get; set; }
        public bool[][] Player2Fleet { get; set; }
        public string[] PlayersDisplay { get; set; }
        public string[] PlayersNames { get; set; }
        public bool[][] BoardP1 { get; set; }
        public bool[][] BoardP2 { get; set; }
    }
}
