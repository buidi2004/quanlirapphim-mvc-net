using System.Data;
using CinemaXNet.Application.Commands;
using CinemaXNet.Application.Interfaces;
using Dapper;
using MediatR;

namespace CinemaXNet.Application.Handlers;

// TicketPaidEventHandler: Bộ lắng nghe (Handler) sự kiện TicketPaidEvent.
// Mục đích: Tách rời logic thanh toán chính ra khỏi logic phụ (cộng điểm tích lũy & thăng hạng thành viên), giúp code gọn gàng chuẩn Clean Architecture.
public class TicketPaidEventHandler(IDbConnection db, IUserService userService) : INotificationHandler<TicketPaidEvent>
{
    public async Task Handle(TicketPaidEvent notification, CancellationToken cancellationToken)
    {
        // 1. Tỷ lệ quy đổi điểm thưởng: Cứ mỗi 1,000 VNĐ chi tiêu sẽ nhận được 1 điểm thưởng (Loyalty Point)
        var addPoints = (int)(notification.TotalPrice / 1000);

        // 2. Cập nhật tổng tiền đã chi tiêu (total_spent) và điểm tích lũy (loyalty_points) vào bảng users
        await db.ExecuteAsync(@"
            UPDATE users 
            SET total_spent = total_spent + @Amount, 
                loyalty_points = loyalty_points + @Points 
            WHERE id = @UserId", 
            new { Amount = (double)notification.TotalPrice, Points = addPoints, UserId = notification.UserId },
            notification.Transaction);

        // 3. Tự động gọi UserService để tính toán xem với số tiền tích lũy mới này, người dùng có đủ điều kiện thăng hạng (Đồng -> Bạc -> Vàng -> Kim Cương) hay không.
        await userService.RecalculateMemberTierAsync(notification.UserId, notification.Transaction);
    }
}
