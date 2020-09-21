using System.Threading.Tasks;

namespace Battleships.Services
{
    public interface IEmailSender
    {
        Task<bool> SendEmailAsync(string email, string v1, string v2);
    }
}