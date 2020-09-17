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
        private static readonly HttpClient client = new HttpClient();

        public HttpService(IConfiguration config)
        {
            _configuration = config;
        }

        public async Task<RecaptchaVerificationResponseModel> VerifyCaptchaAsync(string captchaToken, string ip)
        {
            string secret = _configuration["ReCaptcha3:SecretKey"];

            return await GetCaptchaRequestAsync(captchaToken, ip, secret);
        }

        private async Task<RecaptchaVerificationResponseModel> GetCaptchaRequestAsync(string captchaToken, string ip, string secret)
        {
            Dictionary<string, string> values = new Dictionary<string, string>
            {
                { "secret", secret },
                { "response", captchaToken },
                { "remoteip", ip }
            };

            var content = new FormUrlEncodedContent(values);

            HttpResponseMessage response = await client.PostAsync(_configuration["ReCaptcha3:Url"], content);

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
