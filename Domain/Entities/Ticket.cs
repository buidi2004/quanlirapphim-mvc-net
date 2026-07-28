namespace CinemaXNet.Domain.Entities;

// Ticket Entity: Đại diện cho Bảng vé xem phim (tickets) trong Database
public class Ticket
{
    public int Id { get; set; }
    public int ShowtimeId { get; set; }              // Khóa ngoại liên kết Suất chiếu
    public int? UserId { get; set; }                  // Khóa ngoại liên kết Người dùng (null nếu là Khách vãng lai mua tại quầy)
    public string? GuestEmail { get; set; }          // Email của khách vãng lai
    public string? GuestPhone { get; set; }          // SĐT của khách vãng lai
    public string SeatCode { get; set; } = "";       // Mã vị trí ghế (Ví dụ: "A1", "H8")
    public string Status { get; set; } = "holding";  // Trạng thái vé: 'holding' (đang giữ) | 'paid' (đã mua) | 'cancelled' (đã hủy)
    public DateTime? HoldExpiryTime { get; set; }    // Mốc thời gian hết hạn giữ chỗ (NULL khi đã thanh toán hoặc hủy)
    public decimal TotalPrice { get; set; }           // Giá tiền thực tế của vé
    public string? PromotionCode { get; set; }       // Mã giảm giá áp dụng (nếu có)
    public int Version { get; set; }                 // Cột Version hỗ trợ Khóa cơ chế lạc quan (Optimistic Concurrency Control) chống tranh chấp vé
    public DateTime BookedAt { get; set; }

    public bool IsHolding => Status == "holding";
    public bool IsPaid => Status == "paid";

    // Tự động kiểm tra xem phiên giữ chỗ này đã quá giờ (quá 15 phút) hay chưa
    public bool IsExpired =>
        IsHolding && HoldExpiryTime.HasValue && HoldExpiryTime.Value < DateTime.UtcNow;
}
