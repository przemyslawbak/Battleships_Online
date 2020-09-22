using Battleships.Models;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class HttpService : IHttpService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientProvider _httpClient;
        private static HttpClient _sharedHttpClient;

        public HttpService(IConfiguration config, IHttpClientProvider httpClient)
        {
            _configuration = config;
            _httpClient = httpClient;
            _sharedHttpClient = _httpClient.GetHttpClient();
        }

        /// <summary>
        /// Verifies if passed captchaToken is correct by sending HTTP request to the Goole Web Api, together with extracted IP address and secret string.
        /// </summary>
        /// <param name="captchaToken">String captchaToken.</param>
        /// <param name="ip">String IP address.</param>
        /// <returns>Boolean captcha token verification.</returns>
        public async Task<bool> VerifyCaptchaAsync(string captchaToken, string ip)
        {
            string secret = _configuration["ReCaptcha3:SecretKey"];
            double minScore = _configuration.GetValue<double>("ReCaptcha3:AcceptedMinScore");

            RecaptchaVerificationResponseModel result =  await GetCaptchaResponseAsync(captchaToken, ip, secret);

            if (result.Success && result.Score > minScore)
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Gets captcha token verification response.
        /// </summary>
        /// <param name="captchaToken">String captchaToken.</param>
        /// <param name="ip">String IP address.</param>
        /// <param name="secret">String Google API secret.</param>
        /// <returns>RecaptchaVerificationResponseModel</returns>
        private async Task<RecaptchaVerificationResponseModel> GetCaptchaResponseAsync(string captchaToken, string ip, string secret)
        {
            Dictionary<string, string> values = new Dictionary<string, string>
            {
                { "secret", secret },
                { "response", captchaToken },
                { "remoteip", ip }
            };

            FormUrlEncodedContent content = new FormUrlEncodedContent(values);
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, _configuration["ReCaptcha3:Url"])
            {
                Content = content
            };

            HttpResponseMessage response = await _sharedHttpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            if (response.StatusCode == HttpStatusCode.OK)
            {
                return await response.Content.ReadAsAsync<RecaptchaVerificationResponseModel>(new[] { new JsonMediaTypeFormatter() });
            }
            else
            {
                return new RecaptchaVerificationResponseModel() { Success = false };
            }
        }
    }
}
