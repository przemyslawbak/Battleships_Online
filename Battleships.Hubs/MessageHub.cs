using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Battleships.Hubs
{
    [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
    public class MessageHub : Hub
    {
        private readonly IUserService _userService;
        private readonly IMemoryAccess _memoryAccess;
        private readonly IMessenger _messenger;
        private readonly IGameService _gameService;

        public MessageHub(IUserService userService, IMemoryAccess memory, IMessenger messenger, IGameService gameService)
        {
            _userService = userService;
            _memoryAccess = memory;
            _messenger = messenger;
            _gameService = gameService;
        }

        public async Task SendChatMessage(string message, string[] playerNames)
        {
            await _messenger.SendChatMessageToUsersInGame(message, playerNames, Clients);
        }

        public async Task SendGameState(GameStateModel game)
        {

            await _gameService.UpdateGame(game, Clients);
        }

        public override async Task OnConnectedAsync()
        {
            string userName = await _userService.GetUserNameById(Context.User.Identity.Name);
            string connectionId = Context.ConnectionId;

            Dictionary<string, string> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Add(userName, connectionId);

            _memoryAccess.SetConnectionIdList(ids);
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string userName = await _userService.GetUserNameById(Context.User.Identity.Name);

            Dictionary<string, string> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Remove(userName);
            _memoryAccess.SetConnectionIdList(ids);

            List<GameStateModel> playersGames = _gameService.GetPlayersGames(userName);
            playersGames = _gameService.RemovePlayerFromGames(playersGames, userName);
            await MessageAllPlayersInAllGames(playersGames);
            await RemoveEmptyGames(playersGames);
        }

        private async Task RemoveEmptyGames(List<GameStateModel> playersGames)
        {
            foreach (GameStateModel game in playersGames)
            {
                await _gameService.RemoveGameIfEmpty(game, Clients);
            }
        }

        private async Task MessageAllPlayersInAllGames(List<GameStateModel> playersGames)
        {
            foreach (GameStateModel game in playersGames)
            {
                string[] playerNames = new string[] { game.Players[0].UserName, game.Players[1].UserName };

                await _messenger.SendChatMessageToUsersInGame("Left the game.", playerNames, Clients);
            }
        }
    }
}
