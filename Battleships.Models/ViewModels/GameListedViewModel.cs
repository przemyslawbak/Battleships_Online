namespace Battleships.Models.ViewModels
{
    public class GameListedViewModel
    {
        public int GameId { get; set; }
        public int GameTurnNumber { get; set; }
        public string[] PlayersNames { get; set; }
    }
}
