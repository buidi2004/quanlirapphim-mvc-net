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

    public async Task UpdateConcessionStatusAsync(int ticketId, string concessionStatus)
    {
        await repository.UpdateConcessionStatusAsync(ticketId, concessionStatus);
    }
}
