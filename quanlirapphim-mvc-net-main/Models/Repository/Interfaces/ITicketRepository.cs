using CinemaXNet.Models.Domain;

namespace CinemaXNet.Models.Repository.Interfaces;

public interface ITicketRepository
{
    Task<Ticket?> FindByIdAsync(int id);
    Task<IEnumerable<string>> GetActiveSeatsAsync(int showtimeId, IEnumerable<string> seatCodes);
    Task<IDictionary<string, string>> GetActiveTicketsAsync(int showtimeId);
    Task<int> CreateAsync(Ticket ticket);
    Task<int> UpdateStatusWithVersionAsync(int id, string newStatus, int expectedVersion,
        decimal? totalPrice = null, string? promotionCode = null);
    Task<int> CancelExpiredHoldsAsync();
    Task<IEnumerable<dynamic>> FindByUserIdAsync(int userId);
    Task<Showtime?> GetShowtimeByTicketIdAsync(int ticketId);
}
