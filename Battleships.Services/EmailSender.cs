﻿using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.Threading.Tasks;

namespace Battleships.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;

        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendEmailAsync(string email, string subject, string message)
        {
            MimeMessage msg = PrepareMesaage(message, subject, email);

            return await SendViaClientAsync(msg);
        }

        private async Task<bool> SendViaClientAsync(MimeMessage msg)
        {
            try
            {
                using (SmtpClient client = new SmtpClient())
                {
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    client.Connect("mail.4sea-data.com", 465, true);
                    client.Authenticate(_configuration["ServiceSecret:NoReplyAddress"], _configuration["ServiceSecret:NoReplyPassword"]);
                    await client.SendAsync(msg);
                    client.Disconnect(true);
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        private MimeMessage PrepareMesaage(string message, string subject, string email)
        {
            MimeMessage mailMessage = new MimeMessage();
            mailMessage.From.Add(new MailboxAddress("4Sea Data", _configuration["ServiceSecret:NoReplyAddress"]));
            mailMessage.To.Add(new MailboxAddress("4Sea Data - No reply", email));
            mailMessage.Subject = subject;
            mailMessage.Body = new TextPart("plain")
            {
                Text = message
            };

            return mailMessage;
        }
    }
}
