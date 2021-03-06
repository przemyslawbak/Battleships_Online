﻿using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Battleships.Models.ViewModels
{
    [JsonObject(MemberSerialization.OptOut)]
    public class UserRegisterViewModel
    {
        [Required(ErrorMessage = "Please fill up your user name.")]
        public string UserName { get; set; }
        [Required(ErrorMessage = "Please fill up your password.")]
        public string Password { get; set; }
        [Required(ErrorMessage = "Please fill up your email address.")]
        [EmailAddress(ErrorMessage = "Please write a valid e-mail address.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Please fill up your displayed name.")]
        public string DisplayName { get; set; }
        [Required(ErrorMessage = "Captcha verification is required.")]
        public string CaptchaToken { get; set; }
    }
}
