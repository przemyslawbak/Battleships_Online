using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Battleships.AppWeb.Hubs
{
    [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
    public class MessageHub : Hub
    {
        private readonly IUserService _userService;
        private readonly IMemoryAccess _memoryAccess;

        public MessageHub(IUserService userService, IMemoryAccess memory)
        {
            _userService = userService;
            _memoryAccess = memory;
        }
        public async Task SendMessage(GameStateModel game)
        {
            UpdateCacheGameList(game);

            await Clients.All.SendAsync("ReceiveMessage", game); //todo: send only to users in this game
        }

        private void UpdateCacheGameList(GameStateModel game)
        {
            List<GameStateModel> games = _memoryAccess.GetGameList();
            GameStateModel thisGame = games.Where(g => g.GameId == game.GameId).FirstOrDefault();
            if (thisGame != null)
            {
                games.Remove(thisGame);
            }
            games.Add(game);
            _memoryAccess.SetGameList(games);
        }

        public override async Task OnConnectedAsync()
        {
            //todo: do I need this?
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            //remove player from all games
            GameStateModel game = new GameStateModel();

            await Clients.All.SendAsync("ReceiveMessage", game);
        }

        private async Task<string> GetUserName(string id)
        {
            return await _userService.GetUserNameById(id);
        }
    }
}
