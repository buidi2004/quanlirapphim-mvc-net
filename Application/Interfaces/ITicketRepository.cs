using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface ITicketRepository
{
    Task<Ticket?> FindByIdAsync(int id);
    Task<IEnumerable<string>> GetActiveSeatsAsync(int showtimeId, IEnumerable<string> seatCodes);
    Task<IDictionary<string, string>> GetActiveTicketsAsync(int showtimeId);
    Task<IDictionary<int, int>> GetActiveTicketCountsAsync(IEnumerable<int> showtimeIds);
    Task<int> CreateAsync(Ticket ticket);
    Task<int> UpdateStatusWithVersionAsync(int id, string newStatus, int expectedVersion,
        decimal? totalPrice = null, string? promotionCode = null);
    Task<int> CancelExpiredHoldsAsync();
    Task<IEnumerable<dynamic>> FindByUserIdAsync(int userId);
    Task<(int TotalTickets, int TotalMovies)> GetUserTicketStatsAsync(int userId);
    Task<IEnumerable<dynamic>> GetUserTransactionsAsync(int userId, string? status);
    Task<CinemaXNet.Application.ViewModels.TicketDetailViewModel?> GetTicketDetailAsync(int ticketId, int userId);
    Task<(IEnumerable<dynamic> Items, int TotalCount)> GetAdminPaginatedTicketsAsync(int page, int pageSize);
    Task<Showtime?> GetShowtimeByTicketIdAsync(int ticketId);
}
