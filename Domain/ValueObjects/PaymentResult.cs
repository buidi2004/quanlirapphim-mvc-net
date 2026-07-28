namespace CinemaXNet.Domain.ValueObjects;

// PaymentResult: Value Object đóng gói kết quả phản hồi từ cổng thanh toán (VNPay / MoMo)
public class PaymentResult
{
    public bool Success { get; init; }                  // Trạng thái giao dịch (true = Thành công, false = Thất bại)
    public string TransactionId { get; init; } = "";   // Mã giao dịch ngân hàng / cổng thanh toán cấp
}
