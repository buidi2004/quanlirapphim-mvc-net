// IRefundRepository: Interface dinh nghia cac phuong thuc Hop dong cho IRefund
﻿namespace CinemaXNet.Application.Interfaces;

public interface IRefundRepository
{
    Task<IEnumerable<dynamic>> SearchTicketsAsync(string query);
    Task<dynamic?> GetTicketStatusAsync(int ticketId);
    Task CancelTicketAsync(int ticketId, string reason);
}
