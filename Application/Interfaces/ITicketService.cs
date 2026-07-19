using CinemaXNet.Domain.ValueObjects;
using CinemaXNet.Application.ViewModels;

namespace CinemaXNet.Application.Interfaces;

public interface ITicketService
{
    Task<HoldResult> HoldSeatsAsync(int? userId, int showtimeId, IEnumerable<string> seatCodes, string? guestEmail = null, string? guestPhone = null);
    Task<bool> ConfirmPaymentAsync(IEnumerable<int> ticketIds, int? userId,
        string paymentMethod, decimal? totalPrice = null, string? promotionCode = null, IEnumerable<(int FoodBeverageId, int Quantity, decimal Price)>? concessions = null);
    Task<IEnumerable<(int ShowtimeId, string SeatCode)>> ReleaseExpiredHoldsAsync();
    Task<IEnumerable<dynamic>> GetUserTicketsAsync(int userId);
    Task<(int TotalTickets, int TotalMovies)> GetUserTicketStatsAsync(int userId);
    Task<IEnumerable<dynamic>> GetUserTransactionsAsync(int userId, string? status);
    Task<(IEnumerable<dynamic> Items, int TotalCount)> GetAdminPaginatedTicketsAsync(int page, int pageSize);
    Task<TicketDetailViewModel?> GetTicketDetailAsync(int ticketId, int userId);
    Task<BookingConfirmViewModel> BuildConfirmViewModelAsync(IEnumerable<int> ticketIds, int? userId = null);
}
