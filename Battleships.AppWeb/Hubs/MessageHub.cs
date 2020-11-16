using Battleships.Models;
using Battleships.Models.ViewModels;
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

        public async Task SendChatMessage(string message, string[] playersNames)
        {
            await SendChatMessageToUsersInGame(message, playersNames);
        }

        private async Task SendChatMessageToUsersInGame(string message, string[] playersNames)
        {
            foreach (string user in playersNames)
            {
                if (!string.IsNullOrEmpty(user))
                {
                    string id = GetConnectionId(user);
                    string displayName = await GetUserDisplay(Context.User.Identity.Name);
                    ChatMessageViewModel msg = new ChatMessageViewModel()
                    {
                        DisplayName = displayName,
                        Message = message
                    };
                    await Clients.Client(id).SendAsync("ReceiveChatMessage", msg);
                }
            }
        }

        public async Task SendGameState(GameStateModel game)
        {
            UpdateExistingGame(game);

            await SendGameStateToUsersInGame(game);
        }

        private async Task SendGameStateToUsersInGame(GameStateModel game)
        {
            foreach (string user in game.PlayersNames)
            {
                if (!string.IsNullOrEmpty(user))
                {
                    string id = GetConnectionId(user);
                    await Clients.Client(id).SendAsync("ReceiveGameState", game);
                }
            }
        }

        private string GetConnectionId(string user)
        {
            Dictionary<string, string> ids = _memoryAccess.GetUserConnectionIdList();
            return ids[user];
        }

        public override async Task OnConnectedAsync()
        {
            string userName = await GetUserName(Context.User.Identity.Name);
            string connectionId = Context.ConnectionId;

            Dictionary<string, string> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Add(userName, connectionId);

            _memoryAccess.SetConnectionIdList(ids);
        }

        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string userName = await GetUserName(Context.User.Identity.Name);
            string userDisplay = await GetUserDisplay(Context.User.Identity.Name);
            Dictionary<string, string> ids = _memoryAccess.GetUserConnectionIdList();
            ids.Remove(userName);
            _memoryAccess.SetConnectionIdList(ids);

            List<GameStateModel> playersGames = _memoryAccess.GetGameList().Where(g => g.PlayersNames.Any(userName.Contains)).ToList();
            foreach (GameStateModel game in playersGames)
            {
                game.PlayersNames = game.PlayersNames.Select(p => p.Replace(userName, string.Empty)).ToArray();
                game.PlayersDisplay = game.PlayersDisplay.Select(p => p.Replace(userDisplay, string.Empty)).ToArray();

                await SendChatMessageToUsersInGame("Left the game.", game.PlayersNames);
                await SendGameState(game);

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

        private async Task<string> GetUserDisplay(string id)
        {
            return await _userService.GetUserDisplayById(id);
        }

        private async Task<string> GetUserName(string id) //todo: remove username from models, replace with user ID
        {
            return await _userService.GetUserNameById(id);
        }
    }
}
