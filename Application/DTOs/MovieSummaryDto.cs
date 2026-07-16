namespace CinemaXNet.Application.DTOs;

public class MovieSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? PosterUrl { get; set; }
    public string? Genre { get; set; }
    public string Status { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string AgeRating { get; set; } = string.Empty;
    public string? Director { get; set; }
    public string? Cast { get; set; }
    public string? Description { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? TrailerUrl { get; set; }
}
