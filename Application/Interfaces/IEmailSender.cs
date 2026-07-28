// IEmailSender: Interface dinh nghia cac phuong thuc Hop dong cho IEmailSender
﻿namespace CinemaXNet.Application.Interfaces;

public interface IEmailSender
{
    Task SendEmailAsync(string email, string subject, string htmlMessage);
}
