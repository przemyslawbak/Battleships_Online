using Battleships.Helpers;
using Battleships.Models;
using Battleships.Models.ViewModels;
using Battleships.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : Controller
    {
        private readonly IMemoryAccess _memoryAccess;
        private readonly IGameService _gameService;

        public GameController(IMemoryAccess memory, IGameService gameService)
        {
            _memoryAccess = memory;
            _gameService = gameService;
        }

        /// <summary>
        /// POST: api/game/start
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("start")]
        [ValidateModel]
        [ServiceFilter(typeof(SanitizeModelAttribute))]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult StartGame([FromBody] GameStateModel model)
        {
            List<GameStateModel> list = _memoryAccess.GetGameList();
            list.Add(model);
            _memoryAccess.SetGameList(list);

            return Ok();
        }

        /// <summary>
        /// GET: api/game/join
        /// </summary>
        /// <returns>Game status model.</returns>
        [HttpGet("join")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult JoinGame(int id)
        {
            List<GameStateModel> list = _memoryAccess.GetGameList();
            GameStateModel model = _memoryAccess.GetGameList().Where(g => g.GameId == id).FirstOrDefault();

            if (model == null)
            {
                return new ObjectResult("Game does not exists.") { StatusCode = 409 };
            }

            return Json(model);
        }

        /// <summary>
        /// GET: api/game/open
        /// </summary>
        /// <returns>List of open games.</returns>
        [HttpGet("open")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult GetOpenGames()
        {
            List<GameListedViewModel> list = (from game in _memoryAccess.GetGameList()
                                        .Where(g => g.GameOpen == true)
                       select new GameListedViewModel()
                       {
                           GameId = game.GameId,
                           GameTurnNumber = game.GameTurnNumber,
                           Playing = game.Players.Where(p => p.UserName != "").Count(),
                           TotalPlayers = game.Players.Count(),
                           Players = new string[] { game.Players[0].DisplayName, game.Players[1].DisplayName }
                       }).ToList();

            list = _gameService.RemoveEmptyGames(list);

            return new OkObjectResult(list);
        }
    }
}
