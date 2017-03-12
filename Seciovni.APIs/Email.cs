using Database.Tables;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Seciovni.APIs
{
    public class Email
    {
        public static async Task SendAsync(User from, User to, string subject, string body)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(from.FullName(), from.Email));
            email.To.Add(new MailboxAddress(to.FullName(), to.Email));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Plain) { Text = body };

            using (var client = new SmtpClient())
            {
                // Set this up eventually
                //client.LocalDomain = "some.domain.com";
                //await client.ConnectAsync("smtp.relay.uri", 25, SecureSocketOptions.None).ConfigureAwait(false);
                //await client.SendAsync(emailMessage).ConfigureAwait(false);
                //await client.DisconnectAsync(true).ConfigureAwait(false);
            }
        }
    }
}
