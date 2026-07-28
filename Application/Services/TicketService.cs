// TicketService: Service xu ly cac logic nghiep vu (Business Logic) cho Ticket
using System.Data;
using CinemaXNet.Domain.Exceptions;
using Dapper;
using CinemaXNet.Domain.ValueObjects;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Domain.Constants;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using CinemaXNet.Application.Commands;
using MediatR;

namespace CinemaXNet.Application.Services;

// TicketService: Đảm nhận các logic nghiệp vụ quan trọng nhất của toàn bộ hệ thống đặt vé xem phim.
// Bao gồm: Giữ chỗ tạm thời (HoldSeats), Xác nhận thanh toán (ConfirmPayment), và Tính toán chiết khấu.
public class TicketService(
    ITicketRepository ticketRepo, 
    IDynamicPricingService pricingService,
    IDbConnection db,
    IMediator mediator) : ITicketService
{
    private const int MinTickets  = 1;  // Tối thiểu chọn 1 vé
    private const int MaxTickets  = 8;  // Tối đa chọn 8 vé/lần để tránh tình trạng đầu cơ vé
    private const int HoldMinutes = 15; // Thời gian giữ ghế tối đa là 15 phút

    // Hàm thực hiện Giữ Ghế Tạm Thời (Hold Seats)
    public async Task<HoldResult> HoldSeatsAsync(int? userId, int showtimeId, IEnumerable<string> seatCodes, string? guestEmail = null, string? guestPhone = null)
    {
        var codes = seatCodes.ToList();

        if (codes.Count < MinTickets)
            throw new BusinessException("Vui lòng chọn ít nhất 1 ghế.");
        if (codes.Count > MaxTickets)
            throw new BusinessException($"Chỉ được đặt tối đa {MaxTickets} vé mỗi lần.");

        // 1. Kiểm tra xem các ghế người dùng vừa chọn có bị người khác đặt/giữ từ trước chưa (truy vấn DB)
        var takenSeats = (await ticketRepo.GetActiveSeatsAsync(showtimeId, codes)).ToList();
        if (takenSeats.Count > 0)
            throw new SeatUnavailableException(takenSeats); // Báo lỗi nếu có ít nhất 1 ghế bị trùng

        // 2. Mở Transaction để đảm bảo tính toàn vẹn (ACID): Thêm tất cả vé cùng lúc hoặc không thêm vé nào.
        if (db is System.Data.Common.DbConnection dbConn && dbConn.State == System.Data.ConnectionState.Closed)
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
                    Status        = TicketStatus.Holding,
                    HoldExpiryTime = expiryTime,
                    TotalPrice    = 0,
                    Version       = 0
                };
                ticketIds.Add(await ticketRepo.CreateAsync(ticket, transaction));
            }

            transaction.Commit();
            return new HoldResult(ticketIds, expiryTime);
        }
        catch (MySqlConnector.MySqlException ex) when (ex.ErrorCode == MySqlConnector.MySqlErrorCode.DuplicateKeyEntry)
        {
            // Bắt lỗi Unique Constraint trong Database (Xử lý concurrency xung đột giữa 2 request giữ ghế cùng millisecond)
            transaction.Rollback();
            throw new BusinessException("Ghế bạn chọn vừa bị người khác nhanh tay đặt trước. Vui lòng thử lại!");
        }
        catch
        {
            transaction.Rollback(); // Rollback nếu có bất kỳ lỗi không mong muốn nào khác
            throw;
        }
    }

    // Xử lý logic và luồng thực thi cho phương thức ConfirmPaymentAsync
    public async Task<bool> ConfirmPaymentAsync(
        IEnumerable<int> ticketIds, int? userId,
        string paymentMethod, decimal? totalPrice = null, string? promotionCode = null, IEnumerable<(int FoodBeverageId, int Quantity, decimal Price)>? concessions = null)
    {
        var ids = ticketIds.ToList();

        if (db is System.Data.Common.DbConnection dbConn && dbConn.State == System.Data.ConnectionState.Closed)
            await dbConn.OpenAsync();

        using var transaction = db.BeginTransaction();
        try
        {
            var individualPrice = totalPrice.HasValue ? totalPrice.Value / ids.Count : (decimal?)null;

            // 1. Pre-check all tickets
            var seatCodes = new List<string>();
            foreach (var ticketId in ids)
            {
                var ticket = await ticketRepo.FindByIdAsync(ticketId, transaction)
                    ?? throw new BusinessException("Không tìm thấy thông tin vé.");

                if (ticket.UserId != userId && userId != null)
                    throw new BusinessException("Không có quyền xác nhận vé này.");

                if (ticket.IsExpired)
                    throw new BusinessException("Phiên giữ chỗ đã hết hạn. Vui lòng chọn ghế lại.");

                seatCodes.Add(ticket.SeatCode);
            }

            // 2. Cập nhật trạng thái hàng loạt sang ĐÃ THANH TOÁN (Paid) đồng thời kiểm tra Concurrency Version
            var rowsAffected = await ticketRepo.UpdateMultipleStatusesWithVersionAsync(
                ids, TicketStatus.Paid, individualPrice, promotionCode, transaction);

            if (rowsAffected != ids.Count)
            {
                // Nếu số dòng bị ảnh hưởng khác số vé cần mua -> Có ghế đã bị sửa bởi transaction khác hoặc hết hạn.
                throw new ConcurrencyException("Một hoặc nhiều ghế bạn chọn vừa được người khác đặt hoặc đã hết hạn. Vui lòng chọn lại.");
            }

            if (concessions != null && concessions.Any() && ids.Count > 0)
            {
                var firstTicketId = ids.First();
                foreach (var conc in concessions)
                {
                    const string insertConcessionSql = @"
                        INSERT INTO ticket_concessions (ticket_id, food_beverage_id, quantity, price)
                        VALUES (@TicketId, @FoodBeverageId, @Quantity, @Price)";
                    await db.ExecuteAsync(insertConcessionSql, new 
                    {
                        TicketId = firstTicketId,
                        FoodBeverageId = conc.FoodBeverageId,
                        Quantity = conc.Quantity,
                        Price = conc.Price
                    }, transaction);
                }
            }

            if (!string.IsNullOrEmpty(promotionCode))
            {
                await db.ExecuteAsync("UPDATE promotions SET used_count = used_count + 1 WHERE code = @Code", new { Code = promotionCode }, transaction);
            }

            // Kích hoạt sự kiện TicketPaidEvent thông qua MediatR để xử lý bất đồng bộ các tác vụ phụ:
            // Tự động cộng điểm tích lũy và xét thăng hạng thành viên cho User mà không làm chậm hàm thanh toán chính.
            if (userId != null && totalPrice.HasValue && totalPrice.Value > 0)
            {
                await mediator.Publish(new TicketPaidEvent 
                { 
                    UserId = userId.Value, 
                    TotalPrice = totalPrice.Value,
                    Transaction = transaction
                });
            }

            transaction.Commit(); // Hoàn tất giao dịch thanh toán
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    // Xử lý logic và luồng thực thi cho phương thức ReleaseExpiredHoldsAsync
    public Task<IEnumerable<(int ShowtimeId, string SeatCode)>> ReleaseExpiredHoldsAsync() =>
        ticketRepo.CancelExpiredHoldsAsync();

    // Xử lý logic và luồng thực thi cho phương thức GetUserTicketsAsync
    public Task<IEnumerable<dynamic>> GetUserTicketsAsync(int userId) =>
        ticketRepo.FindByUserIdAsync(userId);

    // Xử lý logic và luồng thực thi cho phương thức BuildConfirmViewModelAsync
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
            CinemaName    = showtime.Room!.Cinema?.Name ?? "CinemaX",
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

    // Xử lý logic và luồng thực thi cho phương thức Items
    public async Task<(IEnumerable<dynamic> Items, int TotalCount)> GetAdminPaginatedTicketsAsync(int page, int pageSize)
    {
        return await ticketRepo.GetAdminPaginatedTicketsAsync(page, pageSize);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetTicketDetailAsync
    public async Task<TicketDetailViewModel?> GetTicketDetailAsync(int ticketId, int userId)
    {
        return await ticketRepo.GetTicketDetailAsync(ticketId, userId);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetUserTicketStatsAsync
    public async Task<(int TotalTickets, int TotalMovies)> GetUserTicketStatsAsync(int userId)
    {
        return await ticketRepo.GetUserTicketStatsAsync(userId);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetUserTransactionsAsync
    public async Task<IEnumerable<dynamic>> GetUserTransactionsAsync(int userId, string? status)
    {
        return await ticketRepo.GetUserTransactionsAsync(userId, status);
    }
}
