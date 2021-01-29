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
            string callersUserName = await _userService.GetUserNameById(Context.User.Identity.Name);
            await _messenger.SendChatMessageToUsersInGame(message, playerNames, Clients, callersUserName);
        }

        public async Task SendGameState(GameStateModel game)
        {
            _memoryAccess.UpdateGame(game);
            await _messenger.SendGameStateToUsersInGame(game, Clients);
        }

        public override async Task OnConnectedAsync()
        {
            string callersUserName = await _userService.GetUserNameById(Context.User.Identity.Name);
            string connectionId = Context.ConnectionId;

            Dictionary<string, object> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Add(callersUserName, connectionId);

            _memoryAccess.SetConnectionIdList(ids);
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string callersUserName = await _userService.GetUserNameById(Context.User.Identity.Name);

            Dictionary<string, object> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Remove(callersUserName);
            _memoryAccess.SetConnectionIdList(ids);

            List<GameStateModel> playersGames = _gameService.GetPlayersGames(callersUserName);
            playersGames = _gameService.RemovePlayerFromGames(playersGames, callersUserName);
            await MessageAllPlayersInAllGames(playersGames, callersUserName);
            await RemoveEmptyGames(playersGames);
        }

        private async Task RemoveEmptyGames(List<GameStateModel> playersGames)
        {
            foreach (GameStateModel game in playersGames)
            {
                await _gameService.RemoveGameIfEmpty(game, Clients);
            }
        }

        private async Task MessageAllPlayersInAllGames(List<GameStateModel> playersGames, string callersDisplayName)
        {
            foreach (GameStateModel game in playersGames)
            {
                string[] playerNames = new string[] { game.Players[0].UserName, game.Players[1].UserName };

                await _messenger.SendChatMessageToUsersInGame("Left the game.", playerNames, Clients, callersDisplayName);
            }
        }
    }
}
