namespace CinemaXNet.Application.Interfaces;

public interface IScannerService
{
    Task<dynamic?> GetTicketDetailsForScanAsync(int ticketId);
    Task UpdateTicketStatusAsync(int ticketId, string status);
}
