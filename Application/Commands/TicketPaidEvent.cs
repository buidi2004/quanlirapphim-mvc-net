using MediatR;

namespace CinemaXNet.Application.Commands;

// TicketPaidEvent: Đóng vai trò là một "Domain Event" (Sự kiện Miền) trong kiến trúc MediatR.
// Khi thanh toán vé thành công, sự kiện này sẽ được phát (Publish) ra để các Handler xử lý ngầm (ví dụ: cộng điểm, tính lại hạng thành viên).
public class TicketPaidEvent : INotification
{
    public int UserId { get; set; }           // ID của người mua vé
    public decimal TotalPrice { get; set; }     // Tổng số tiền đã thanh toán
    public System.Data.IDbTransaction? Transaction { get; set; } // Transaction DB chung (đảm bảo rollback nếu có lỗi)
}
