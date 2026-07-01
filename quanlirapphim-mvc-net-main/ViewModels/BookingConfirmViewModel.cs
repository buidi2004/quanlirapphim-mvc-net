namespace CinemaXNet.ViewModels;

public class BookingConfirmViewModel
{
    public string MovieTitle { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public string RoomName { get; set; } = "";
    public List<string> SelectedSeats { get; set; } = []; // ['A1', 'A2']
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime HoldExpiryTime { get; set; }
    public string? PromotionCode { get; set; }
    public List<int> TicketIds { get; set; } = [];
}
