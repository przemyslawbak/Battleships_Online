using Battleships.Models;
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

        public GameController(IMemoryAccess memory)
        {
            _memoryAccess = memory;
        }

        /// <summary>
        /// GET: api/game/start
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("start")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult StartGame(GameStateModel model)
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
    }
}
