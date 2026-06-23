namespace CinemaXNet.Models.Domain;

public class Promotion
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string DiscountType { get; set; } = ""; // 'percent' | 'fixed'
    public decimal DiscountValue { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}
