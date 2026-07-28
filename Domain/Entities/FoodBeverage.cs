namespace CinemaXNet.Domain.Entities;

// FoodBeverage Entity: Đại diện cho Bảng Bắp Nước & Đồ Ăn (food_beverages) trong Database
public class FoodBeverage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Tên món (Ví dụ: Combo Bắp Ngọt + 2 Coca)
    public string? Description { get; set; }
    public decimal Price { get; set; }               // Đơn giá
    public string? ImageUrl { get; set; }
    public int StockQuantity { get; set; }          // Số lượng tồn kho còn lại
}
