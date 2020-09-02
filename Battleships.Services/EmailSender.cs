using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
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

        public Task SendEmailAsync(string email, string subject, string message)
        {
            MimeMessage msg = PrepareMesaage(message, subject, email, string.Empty, string.Empty);

            return SendViaClientAsync(msg, string.Empty);
        }

        private async Task SendViaClientAsync(MimeMessage msg, string returnAddress)
        {
            try
            {
                using (var client = new SmtpClient())
                {
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    client.Connect("mail.4sea-data.com", 465, true);
                    client.Authenticate(_configuration["ServiceSecret:NoReplyAddress"], _configuration["ServiceSecret:NoReplyPassword"]);
                    await client.SendAsync(msg);
                    client.Disconnect(true);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(ex.Message);
            }
        }

        private MimeMessage PrepareMesaage(string message, string subject, string email, string returnAddress, string name)
        {
            MimeMessage mailMessage = new MimeMessage();
            mailMessage.From.Add(new MailboxAddress("4Sea Data", _configuration["ServiceSecret:NoReplyAddress"]));
            mailMessage.To.Add(new MailboxAddress("4Sea Data - No reply", email));


            mailMessage.Subject = subject;
            mailMessage.Body = new TextPart("plain")
            {
                Text = message
            };
            if (!string.IsNullOrEmpty(returnAddress) && !string.IsNullOrEmpty(name))
            {
                mailMessage.ReplyTo.Add(new MailboxAddress(name, returnAddress));
            }

            return mailMessage;
        }
    }
}
