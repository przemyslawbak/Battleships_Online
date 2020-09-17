using Battleships.Models;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IHttpService
    {
        Task<RecaptchaVerificationResponseModel> VerifyCaptchaAsync(string captchaToken, string ip);
    }
}