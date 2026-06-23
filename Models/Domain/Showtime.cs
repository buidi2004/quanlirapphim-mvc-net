namespace CinemaXNet.Models.Domain;

public class Showtime
{
    public int Id { get; set; }
    public int MovieId { get; set; }
    public int RoomId { get; set; }
    public DateOnly ShowDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public decimal Price { get; set; }
    public DateTime CreatedAt { get; set; }

    // Eager-loaded relations
    public Movie? Movie { get; set; }
    public Room? Room { get; set; }

    public string GetFormattedPrice() =>
        Price.ToString("N0") + "₫";
}
