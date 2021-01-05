using Battleships.Models;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task SendChatMessage(string message, string[] playersNames)
        {
            await SendChatMessageToUsersInGame(message, playersNames);
        }

        private async Task SendChatMessageToUsersInGame(string message, string[] playersNames)
        {
            foreach (string name in playersNames)
            {
                await _messenger.SendChatMesssage(name, message, Clients, Context);
            }
        }

        public async Task SendGameState(GameStateModel game)
        {
            _gameService.UpdateExistingGame(game);

            await _messenger.SendGameStateToUsersInGame(game, Clients);
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
            string userDisplay = await _userService.GetUserDisplayById(Context.User.Identity.Name);
            Dictionary<string, string> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Remove(userName);
            _memoryAccess.SetConnectionIdList(ids);

            var list = _memoryAccess.GetGameList();
            List<GameStateModel> playersGames = _memoryAccess.GetGameList().Where(g => g.Players.Any(p => p.UserName == userName)).ToList();
            foreach (GameStateModel game in playersGames)
            {
                foreach (var player in game.Players)
                {
                    if (player.UserName == userName)
                    {
                        player.UserName = string.Empty;
                        player.DisplayName = string.Empty;
                    }
                }

                string[] playerNames = new string[] { game.Players[0].UserName, game.Players[1].UserName };

                await SendChatMessageToUsersInGame("Left the game.", playerNames);

                if ((playerNames[0] == string.Empty && playerNames[1] == string.Empty) ||
                    (playerNames[0] == "COMPUTER" && playerNames[1] == string.Empty) ||
                    (playerNames[0] == string.Empty && playerNames[1] == "COMPUTER"))
                {
                    _gameService.RemoveGameFromCacheGameList(game.GameId);
                }
                else
                {
                    await SendGameState(game);
                }
            }
        }
}
