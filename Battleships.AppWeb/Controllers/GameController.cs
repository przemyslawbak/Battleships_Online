using Battleships.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Battleships.AppWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : Controller
    {
        /// <summary>
        /// GET: api/game/start
        /// </summary>
        /// <returns>Status code.</returns>
        [HttpPost("start")]
        [Authorize(AuthenticationSchemes = "Bearer", Roles = "Admin, User")]
        public IActionResult StartGame(GameStartViewModel model)
        {
            return Ok();
        }
    }
}
