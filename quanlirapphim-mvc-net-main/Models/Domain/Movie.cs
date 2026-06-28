namespace CinemaXNet.Models.Domain;

public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? PosterUrl { get; set; }
    public string? Genre { get; set; }
    public string Status { get; set; } = "coming_soon"; // 'now_showing' | 'coming_soon' | 'ended'
    public int DurationMinutes { get; set; }
    public string? Description { get; set; }
    public string? AgeRating { get; set; } // 'P' | 'C13' | 'C16' | 'C18'
    public DateTime CreatedAt { get; set; }
    
    public double AverageRating { get; set; } = 0.0;
    public int ReviewCount { get; set; } = 0;

    public bool IsNowShowing => Status == "now_showing";

    public string GetFormattedDuration()
    {
        int h = DurationMinutes / 60;
        int m = DurationMinutes % 60;
        return h > 0 ? $"{h}h {m}p" : $"{m}p";
    }
}
