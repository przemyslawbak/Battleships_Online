namespace Battleships.Models
{
    public class Player
    {
        public bool IsMyTurn { get; set; }
        public bool IsDeployed { get; set; }
        public ShipComponent[] Fleet { get; set; }
        public string DisplayName { get; set; }
        public string UserName { get; set; }
        public BoardCell[][] Board { get; set; }
    }
}
