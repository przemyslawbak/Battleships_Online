using Battleships.Models;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IHttpService
    {
        Task<bool> VerifyCaptchaAsync(string captchaToken, string ip);
    }
}