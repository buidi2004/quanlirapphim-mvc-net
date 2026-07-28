namespace CinemaXNet.Domain.ValueObjects;

// PromotionResult: Value Object đóng gói kết quả áp dụng mã giảm giá thành công
public class PromotionResult
{
    public string Code { get; init; } = "";             // Mã giảm giá vừa nhập
    public decimal Discount { get; init; }              // Số tiền được giảm (VNĐ)
    public decimal TotalPrice { get; init; }            // Tổng số tiền còn lại sau khi trừ giảm giá
}
