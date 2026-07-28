namespace CinemaXNet.Domain.Entities;

// Promotion Entity: Đại diện cho Bảng Mã Khuyến Mãi / Mã Giảm Giá (promotions) trong Database
public class Promotion
{
    public int Id { get; set; }
    public string Code { get; set; } = "";           // Mã code nhập (Ví dụ: SUMMER2026)
    public string DiscountType { get; set; } = "";   // Loại giảm giá: 'percent' (theo %) hoặc 'fixed' (giảm tiền cố định)
    public decimal DiscountValue { get; set; }       // Giá trị giảm (% hoặc VNĐ)
    public int? MaxUses { get; set; }                // Số lần sử dụng tối đa (Null là không giới hạn)
    public int UsedCount { get; set; }               // Số lần đã được sử dụng
    public DateTime? ExpiresAt { get; set; }         // Ngày hết hạn mã
    public bool IsActive { get; set; } = true;
}
