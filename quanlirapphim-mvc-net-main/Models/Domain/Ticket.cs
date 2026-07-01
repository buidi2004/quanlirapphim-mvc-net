namespace CinemaXNet.Models.Domain;

public class Ticket
{
    public int Id { get; set; }
    public int ShowtimeId { get; set; }
    public int? UserId { get; set; }
    public string? GuestEmail { get; set; }
    public string? GuestPhone { get; set; }
    public string SeatCode { get; set; } = "";
    public string Status { get; set; } = "holding"; // 'holding' | 'paid' | 'cancelled'
    public DateTime? HoldExpiryTime { get; set; }   // NULL khi paid/cancelled
    public decimal TotalPrice { get; set; }
    public string? PromotionCode { get; set; }
    public int Version { get; set; }                // Optimistic Locking
    public DateTime BookedAt { get; set; }

    public bool IsHolding => Status == "holding";
    public bool IsPaid => Status == "paid";

    public bool IsExpired =>
        IsHolding && HoldExpiryTime.HasValue && HoldExpiryTime.Value < DateTime.UtcNow;
}
