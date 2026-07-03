using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ScannerService(IScannerRepository repository) : IScannerService
{
    public async Task<dynamic?> GetTicketDetailsForScanAsync(int ticketId)
    {
        return await repository.GetTicketDetailsForScanAsync(ticketId);
    }

    public async Task UpdateTicketStatusAsync(int ticketId, string status)
    {
        await repository.UpdateTicketStatusAsync(ticketId, status);
    }
}
