using System.Net.Http;

namespace Battleships.Services
{
    public class HttpClientProvider : IHttpClientProvider
    {
        /// <summary>
        /// Returnes instance of HttpClient object.
        /// </summary>
        /// <returns>HttpClient object.</returns>
        public HttpClient GetHttpClient()
        {
            HttpClient httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Clear();
            httpClient.DefaultRequestHeaders.ConnectionClose = false;

            return httpClient;
        }
    }
}
