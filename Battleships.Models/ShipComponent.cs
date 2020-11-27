namespace Battleships.Models
{
    public class ShipComponent
    {
        public int Size { get; set; }
        public int Top { get; set; }
        public int Left { get; set; }
        public int Rotation { get; set; }
        public bool Deployed { get; set; }
    }
}
