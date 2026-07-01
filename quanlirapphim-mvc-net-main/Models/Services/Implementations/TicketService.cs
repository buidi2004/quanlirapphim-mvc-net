using System.Data;
using CinemaXNet.Core.Exceptions;
using Dapper;
using CinemaXNet.Core.ValueObjects;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.ViewModels;

namespace CinemaXNet.Models.Services.Implementations;

public class TicketService(
    ITicketRepository ticketRepo, 
    IDynamicPricingService pricingService,
    IDbConnection db) : ITicketService
{
    private const int MinTickets  = 1;
    private const int MaxTickets  = 8;
    private const int HoldMinutes = 15;

    public async Task<HoldResult> HoldSeatsAsync(int? userId, int showtimeId, IEnumerable<string> seatCodes, string? guestEmail = null, string? guestPhone = null)
    {
        var codes = seatCodes.ToList();

        if (codes.Count < MinTickets)
            throw new BusinessException("Vui lòng chọn ít nhất 1 ghế.");
        if (codes.Count > MaxTickets)
            throw new BusinessException($"Chỉ được đặt tối đa {MaxTickets} vé mỗi lần.");

        var takenSeats = (await ticketRepo.GetActiveSeatsAsync(showtimeId, codes)).ToList();
        if (takenSeats.Count > 0)
            throw new SeatUnavailableException(takenSeats);

        // Transaction
        if (db is System.Data.Common.DbConnection dbConn)
            await dbConn.OpenAsync();

        using var transaction = db.BeginTransaction();
        try
        {
            var expiryTime = DateTime.UtcNow.AddMinutes(HoldMinutes);
            var ticketIds  = new List<int>();

            foreach (var seat in codes)
            {
                var ticket = new Ticket
                {
                    ShowtimeId    = showtimeId,
                    UserId        = userId,
                    GuestEmail    = guestEmail,
                    GuestPhone    = guestPhone,
                    SeatCode      = seat,
                    Status        = "holding",
                    HoldExpiryTime = expiryTime,
                    TotalPrice    = 0,
                    Version       = 0
                };
                ticketIds.Add(await ticketRepo.CreateAsync(ticket));
            }

            transaction.Commit();
            return new HoldResult(ticketIds, expiryTime);
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> ConfirmPaymentAsync(
        IEnumerable<int> ticketIds, int? userId,
        string paymentMethod, decimal? totalPrice = null, string? promotionCode = null)
    {
        var ids = ticketIds.ToList();

        if (db is System.Data.Common.DbConnection dbConn && dbConn.State == System.Data.ConnectionState.Closed)
            await dbConn.OpenAsync();

        using var transaction = db.BeginTransaction();
        try
        {
            var individualPrice = totalPrice.HasValue ? totalPrice.Value / ids.Count : (decimal?)null;

            foreach (var ticketId in ids)
            {
                var ticket = await ticketRepo.FindByIdAsync(ticketId)
                    ?? throw new BusinessException("Không tìm thấy thông tin vé.");

                if (ticket.UserId != userId && userId != null)
                    throw new BusinessException("Không có quyền xác nhận vé này.");

                if (ticket.IsExpired)
                    throw new BusinessException("Phiên giữ chỗ đã hết hạn. Vui lòng chọn ghế lại.");

                var rowsAffected = await ticketRepo.UpdateStatusWithVersionAsync(
                    ticketId, "paid", ticket.Version, individualPrice, promotionCode);

                if (rowsAffected == 0)
                    throw new ConcurrencyException(
                        $"Ghế {ticket.SeatCode} vừa được người khác đặt. Vui lòng chọn ghế khác.");
            }

            // Update loyalty points and membership tier
            if (userId != null && totalPrice.HasValue && totalPrice.Value > 0)
            {
                var addPoints = (int)(totalPrice.Value / 1000); // 1 point per 1000 VND
                await db.ExecuteAsync(@"
                    UPDATE users 
                    SET total_spent = total_spent + @Amount, 
                        loyalty_points = loyalty_points + @Points 
                    WHERE id = @UserId", 
                    new { Amount = (double)totalPrice.Value, Points = addPoints, UserId = userId }, transaction);

                // Re-evaluate membership tier
                var currentSpent = await db.ExecuteScalarAsync<double>("SELECT total_spent FROM users WHERE id = @UserId", new { UserId = userId }, transaction);
                var newTier = await db.QueryFirstOrDefaultAsync<string>(@"
                    SELECT name FROM membership_tiers 
                    WHERE min_spent <= @Spent 
                    ORDER BY min_spent DESC LIMIT 1", 
                    new { Spent = currentSpent }, transaction);
                
                if (!string.IsNullOrEmpty(newTier))
                {
                    await db.ExecuteAsync("UPDATE users SET member_level = @Tier WHERE id = @UserId", new { Tier = newTier, UserId = userId }, transaction);
                }
            }

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public Task<int> ReleaseExpiredHoldsAsync() =>
        ticketRepo.CancelExpiredHoldsAsync();

    public Task<IEnumerable<dynamic>> GetUserTicketsAsync(int userId) =>
        ticketRepo.FindByUserIdAsync(userId);

    public async Task<BookingConfirmViewModel> BuildConfirmViewModelAsync(IEnumerable<int> ticketIds, int? userId = null)
    {
        var ids = ticketIds.ToList();
        if (ids.Count == 0)
            throw new BusinessException("Không có vé nào được chọn.");

        var selectedSeats = new List<string>();
        decimal subtotal  = 0;
        Showtime? showtime = null;
        DateTime? holdExpiryTime = null;

        foreach (var ticketId in ids)
        {
            var ticket = await ticketRepo.FindByIdAsync(ticketId)
                ?? throw new BusinessException($"Không tìm thấy vé với ID {ticketId}");

            if (ticket.IsExpired)
                throw new BusinessException("Thời gian giữ chỗ đã hết hạn. Vui lòng đặt lại.");

            selectedSeats.Add(ticket.SeatCode);

            if (showtime == null)
            {
                showtime = await ticketRepo.GetShowtimeByTicketIdAsync(ticketId)
                    ?? throw new BusinessException("Không tìm thấy suất chiếu cho vé này.");
                showtime.Price = await pricingService.CalculatePriceAsync(showtime);
                holdExpiryTime = ticket.HoldExpiryTime;
            }

            subtotal += showtime.Price;
        }

        decimal discount = 0;
        if (userId.HasValue)
        {
            var discountPercent = await db.ExecuteScalarAsync<double>(@"
                SELECT t.discount_percent 
                FROM users u
                JOIN membership_tiers t ON u.member_level = t.name
                WHERE u.id = @UserId", new { UserId = userId.Value });
            
            if (discountPercent > 0)
            {
                discount = subtotal * (decimal)(discountPercent / 100);
            }
        }

        return new BookingConfirmViewModel
        {
            MovieTitle    = showtime!.Movie!.Title,
            ShowDate      = showtime.ShowDate,
            StartTime     = showtime.StartTime,
            RoomName      = showtime.Room!.Name,
            SelectedSeats = selectedSeats,
            Quantity      = ids.Count,
            Subtotal      = subtotal,
            Discount      = discount,
            TotalPrice    = subtotal - discount,
            HoldExpiryTime = holdExpiryTime ?? DateTime.UtcNow,
            PromotionCode = null,
            TicketIds     = ids
        };
    }
}
