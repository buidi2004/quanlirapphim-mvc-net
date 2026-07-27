using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class RefundService(IRefundRepository repository) : IRefundService
{
    public async Task<IEnumerable<dynamic>> SearchTicketsAsync(string query)
    {
        return await repository.SearchTicketsAsync(query);
    }

    public async Task<dynamic?> GetTicketStatusAsync(int ticketId)
    {
        return await repository.GetTicketStatusAsync(ticketId);
    }

    public async Task CancelTicketAsync(int ticketId, string reason)
    {
        await repository.CancelTicketAsync(ticketId, reason);
    }
}
