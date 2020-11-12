﻿using Battleships.Models;
using System.Collections.Generic;

namespace Battleships.Services
{
    public interface IMemoryAccess
    {
        List<GameStateModel> GetGameList();
        void SetGameList(List<GameStateModel> games);
    }
}