using System.Net.Http;

namespace Battleships.Services
{
    public class HttpClientProvider : IHttpClientProvider
    {
        public HttpClient GetHttpClient()
        {
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Clear();
            httpClient.DefaultRequestHeaders.ConnectionClose = false;

            return httpClient;
        }
    }
}
