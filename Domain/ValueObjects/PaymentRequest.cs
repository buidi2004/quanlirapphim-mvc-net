namespace CinemaXNet.Domain.ValueObjects;

// PaymentRequest: Value Object chứa dữ liệu yêu cầu tạo giao dịch thanh toán gửi sang cổng VNPay/MoMo
public class PaymentRequest
{
    public decimal Amount { get; init; }                // Số tiền cần thanh toán (VNĐ)
    public string OrderDescription { get; init; } = ""; // Nội dung chuyển khoản (Ví dụ: Thanh toan ve xem phim #102)
    public List<int> TicketIds { get; init; } = [];     // Danh sách ID các vé được thanh toán
    public int? UserId { get; init; }
}
