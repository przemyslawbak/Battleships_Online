﻿namespace Battleships.Models
{
    public class BoardCell
    {
        public int ElX { get; set; }
        public int ElY { get; set; }
        public int Row { get; set; }
        public int Col { get; set; }
        public int Value { get; set; }
        public string Color { get; set; }
    }
}
