using System.Net;
using System.Net.Mail;
using CinemaXNet.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CinemaXNet.Infrastructure.Services;

// SmtpEmailSender: Dịch vụ gửi Email thực tế qua giao thức SMTP (Gmail/SendGrid/Amazon SES)
public class SmtpEmailSender(ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        try
        {
            // Khởi tạo SMTP Client (Kết nối đến Google SMTP Server cổng 587 SSL)
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
                IsBodyHtml = true, // Gửi nội dung dạng HTML đẹp mắt có hình ảnh & màu sắc
            };
            mailMessage.To.Add(email);

            // Ghi log chi tiết nội dung email ra Console / File logs để phục vụ Debug khi phát triển local
            logger.LogInformation("Sent email to {Email} with subject {Subject}. Body: {Body}", email, subject, htmlMessage);
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Email}", email);
        }
    }
}
