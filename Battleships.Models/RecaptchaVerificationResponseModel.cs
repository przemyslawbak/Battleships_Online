using System;

namespace Battleships.Models
{
    public class RecaptchaVerificationResponseModel
    {
        public bool Success { get; set; }
        public double Score { get; set; }
        public string Action { get; set; }
        public DateTime TimeStamp { get; set; }
        public string HostName { get; set; }
        public object[] Errors { get; set; }
    }
}
