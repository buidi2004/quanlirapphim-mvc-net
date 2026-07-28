namespace CinemaXNet.Application.ViewModels;

// BookingConfirmViewModel: Đóng gói toàn bộ thông tin đơn hàng giữ ghế tạm thời để hiển thị ở trang Xác nhận & Thanh toán
// Các nhóm dữ liệu chính:
// 1. Thông tin suất chiếu: Tên phim, rạp, phòng, ngày (ShowDate) và giờ chiếu (StartTime).
// 2. Thông tin ghế: Danh sách vị trí ghế (SelectedSeats), số lượng ghế (Quantity) và danh sách ID vé (TicketIds).
// 3. Chi tiết giá cả: Tiền tạm tính (Subtotal), mã giảm giá/tiền giảm (PromotionCode, Discount) và tổng tiền cần trả (TotalPrice).
// 4. Thời gian giữ ghế (HoldExpiryTime): Mốc thời gian hết hạn giữ ghế (nếu quá giờ chưa thanh toán, hệ thống sẽ tự động nhả ghế ra cho người khác đặt).
public class BookingConfirmViewModel
{
    public string MovieTitle { get; set; } = "";
    public string CinemaName { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public string RoomName { get; set; } = "";
    public List<string> SelectedSeats { get; set; } = []; // Ví dụ: ['A1', 'A2']
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime HoldExpiryTime { get; set; }
    public string? PromotionCode { get; set; }
    public List<int> TicketIds { get; set; } = [];
}
