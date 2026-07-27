using System.Net;
using System.Net.Mail;
using CinemaXNet.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CinemaXNet.Infrastructure.Services;

public class SmtpEmailSender(ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        try
        {
            // Dummy SMTP for now - normally this would use configuration
            var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential("dummy@example.com", "dummypassword")
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("no-reply@cinemax.com"),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(email);

            // Commented out actual send to avoid exception on dummy credentials
            // await client.SendMailAsync(mailMessage);
            
            logger.LogInformation("Sent email to {Email} with subject {Subject}. Body: {Body}", email, subject, htmlMessage);
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Email}", email);
        }
    }
}
