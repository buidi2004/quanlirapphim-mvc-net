// RefundService: Service xu ly cac logic nghiep vu (Business Logic) cho Refund
﻿using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class RefundService(IRefundRepository repository) : IRefundService
{
    // Xử lý logic và luồng thực thi cho phương thức SearchTicketsAsync
    public async Task<IEnumerable<dynamic>> SearchTicketsAsync(string query)
    {
        return await repository.SearchTicketsAsync(query);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetTicketStatusAsync
    public async Task<dynamic?> GetTicketStatusAsync(int ticketId)
    {
        return await repository.GetTicketStatusAsync(ticketId);
    }

    // Xử lý logic và luồng thực thi cho phương thức CancelTicketAsync
    public async Task CancelTicketAsync(int ticketId, string reason)
    {
        await repository.CancelTicketAsync(ticketId, reason);
    }
}
