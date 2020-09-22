using System.Net.Http;

namespace Battleships.Services
{
    public interface IHttpClientProvider
    {
        HttpClient GetHttpClient();
    }
}