using Battleships.Models;
using Battleships.Services;
using Battleships.Tests.Helpers;
using Microsoft.Extensions.Configuration;
using Moq;
using Moq.Protected;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Battleships.Tests.UnitTests.Services
{
    public class HttpServiceTests
    {
        private readonly Mock<FakeHttpMessageHandler> _fakeHttpMessageHandlerMock;
        private readonly Mock<IHttpClientProvider> _httpClientMock;
        private readonly HttpService _service;
        private readonly string _testToken;
        private readonly string _testIp;
        private RecaptchaVerificationResponseModel _responseObject;

        public HttpServiceTests()
        {
            _testToken = "some_cool_test_token";
            _testIp = "some_cool_test_ip";

            Dictionary<string, string> myConfiguration = new Dictionary<string, string>()
            {
                {"ReCaptcha3:AcceptedMinScore", "0.5"},
                {"ReCaptcha3:SecretKey", "secret_test_key"},
                {"ReCaptcha3:Url", "https://stackoverflow.com/a/34826506/12603542"}
            };

            IConfiguration fakeConfig = new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();
            _fakeHttpMessageHandlerMock = new Mock<FakeHttpMessageHandler>();
            HttpClient fakeClient = new HttpClient(_fakeHttpMessageHandlerMock.Object);
            _httpClientMock = new Mock<IHttpClientProvider>();

            _httpClientMock.Setup(mock => mock.GetHttpClient()).Returns(fakeClient);

            _service = new HttpService(fakeConfig, _httpClientMock.Object);
        }

        [Theory]
        [InlineData(0.9, true, true)]
        [InlineData(0.4, true, false)]
        [InlineData(0.9, false, false)]
        [InlineData(0.4, false, false)]
        private async Task GetCaptchaResponseAsync_OnCentainHttpResponseValues_ReturnsCorrectBoolean(double score, bool success, bool expected)
        {
            _responseObject = new RecaptchaVerificationResponseModel()
            {
                Score = score,
                Success = success,
            };
            string responseJsonContent = JsonConvert.SerializeObject(_responseObject);
            HttpContent content = new StringContent(responseJsonContent, Encoding.UTF8, "application/json");
            HttpResponseMessage httpResponse = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = content
            };
            _fakeHttpMessageHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(httpResponse);

            bool result = await _service.VerifyCaptchaAsync(_testToken, _testIp);

            Assert.Equal(expected, result);
        }
    }
}
