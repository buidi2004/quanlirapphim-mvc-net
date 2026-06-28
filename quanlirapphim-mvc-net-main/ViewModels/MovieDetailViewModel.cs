using CinemaXNet.Models.Domain;

namespace CinemaXNet.ViewModels;

public class ShowtimeSummary
{
    public int Id { get; set; }
    public DateOnly ShowDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public string FormattedPrice { get; set; } = "";
    public string RoomName { get; set; } = "";
    public int AvailableSeats { get; set; }
}

public class MovieDetailViewModel
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? PosterUrl { get; set; }
    public string? Genre { get; set; }
    public string Status { get; set; } = "";
    public string FormattedDuration { get; set; } = "";
    public string? Description { get; set; }
    public string? AgeRating { get; set; }
    public List<ShowtimeSummary> Showtimes { get; set; } = [];
    public List<Review> Reviews { get; set; } = [];
    public double AverageRating { get; set; } = 0.0;
    public int ReviewCount { get; set; } = 0;

    public static MovieDetailViewModel FromMovie(Movie movie, IEnumerable<ShowtimeSummary> showtimes, IEnumerable<Review>? reviews = null) => new()
    {
        Id                = movie.Id,
        Title             = movie.Title,
        PosterUrl         = movie.PosterUrl,
        Genre             = movie.Genre,
        Status            = movie.Status,
        FormattedDuration = movie.GetFormattedDuration(),
        Description       = movie.Description,
        AgeRating         = movie.AgeRating,
        Showtimes         = showtimes.ToList(),
        Reviews           = reviews?.ToList() ?? [],
        AverageRating     = reviews?.Any() == true ? reviews.Average(r => r.Rating) : 0.0,
        ReviewCount       = reviews?.Count() ?? 0
    };
}
