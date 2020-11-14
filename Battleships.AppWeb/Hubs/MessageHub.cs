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
        public async Task SendMessage(GameStateModel game) //todo: SendMessageAndUpdateCachedGame(GameStateModel game)
        {
            UpdateExistingGame(game);

            await Clients.All.SendAsync("ReceiveMessage", game); //todo: send only to users in this game
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string player = await GetUserName(Context.User.Identity.Name);

            List<GameStateModel> playersGames = _memoryAccess.GetGameList().Where(g => g.PlayersNames.Any(player.Contains)).ToList();
            foreach (var game in playersGames)
            {
                game.PlayersNames = game.PlayersNames.Select(p => p.Replace(player, string.Empty)).ToArray();
                await SendMessage(game);

                if (game.PlayersNames[0] == string.Empty && game.PlayersNames[1] == string.Empty)
                {
                    RemoveGameFromCacheGameList(game.GameId);
                }
            }
        }

        private void RemoveGameFromCacheGameList(int gameId)
        {
            List<GameStateModel> games = _memoryAccess.GetGameList();
            GameStateModel game = _memoryAccess.GetGameList().Where(g => g.GameId == gameId).FirstOrDefault();
            games.Remove(game);
            _memoryAccess.SetGameList(games);
        }

        private void UpdateExistingGame(GameStateModel game)
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

        private async Task<string> GetUserName(string id) //todo: remove username from models, replace with user ID
        {
            return await _userService.GetUserNameById(id);
        }
    }
}
