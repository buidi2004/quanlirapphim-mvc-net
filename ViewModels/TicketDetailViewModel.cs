using CinemaXNet.Models.Domain;

namespace CinemaXNet.ViewModels;

public class TicketDetailViewModel
{
    public Ticket Ticket { get; set; } = null!;
    public string MovieTitle { get; set; } = "";
    public string? PosterUrl { get; set; }
    public string? AgeRating { get; set; }
    public int DurationMinutes { get; set; }
    public string ShowDate { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string RoomName { get; set; } = "";
    public string? CinemaName { get; set; }
    public string? PromotionCode { get; set; }
}
