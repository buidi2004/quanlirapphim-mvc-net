using CinemaXNet.Core.ValueObjects;
using CinemaXNet.ViewModels;

namespace CinemaXNet.Models.Services.Interfaces;

public interface ITicketService
{
    Task<HoldResult> HoldSeatsAsync(int? userId, int showtimeId, IEnumerable<string> seatCodes, string? guestEmail = null, string? guestPhone = null);
    Task<bool> ConfirmPaymentAsync(IEnumerable<int> ticketIds, int? userId,
        string paymentMethod, decimal? totalPrice = null, string? promotionCode = null);
    Task<int> ReleaseExpiredHoldsAsync();
    Task<IEnumerable<dynamic>> GetUserTicketsAsync(int userId);
    Task<BookingConfirmViewModel> BuildConfirmViewModelAsync(IEnumerable<int> ticketIds, int? userId = null);
}
