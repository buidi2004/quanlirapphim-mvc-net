namespace CinemaXNet.Domain.Constants;

// TicketStatus: Định nghĩa các Hằng số về Trạng thái của Vé xem phim
public static class TicketStatus
{
    public const string Holding   = "holding";   // Ghế đang bị giữ tạm thời (tối đa 15 phút đếm ngược)
    public const string Paid      = "paid";      // Vé đã được thanh toán thành công (hợp lệ để vào phòng chiếu)
    public const string Cancelled = "cancelled"; // Vé đã bị hủy do hết hạn giữ chỗ hoặc người dùng hoàn vé
}
