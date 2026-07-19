using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.ViewModels;

public class ShowtimeSummary
{
    public int Id { get; set; }
    public int CinemaId { get; set; }
    public string CinemaName { get; set; } = "";
    public string CinemaAddress { get; set; } = "";
    public string Province { get; set; } = "";
    public DateOnly ShowDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public decimal Price { get; set; }
    public string FormattedPrice { get; set; } = "";
    public string RoomName { get; set; } = "";
    public string Format { get; set; } = "2D Phụ đề";
    public int AvailableSeats { get; set; }
}

public class CinemaShowtimeGroup
{
    public string CinemaName { get; set; } = "";
    public string Address { get; set; } = "";
    public List<ShowtimeSummary> Showtimes { get; set; } = [];
}

public class ProvinceShowtimeGroup
{
    public string Province { get; set; } = "";
    public List<CinemaShowtimeGroup> Cinemas { get; set; } = [];
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
    public List<ProvinceShowtimeGroup> GroupedShowtimes { get; set; } = [];
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
        GroupedShowtimes  = showtimes
            .GroupBy(s => s.Province)
            .Select(gProv => new ProvinceShowtimeGroup
            {
                Province = gProv.Key,
                Cinemas = gProv.GroupBy(s => new { s.CinemaName, s.CinemaAddress })
                    .Select(gCinema => new CinemaShowtimeGroup
                    {
                        CinemaName = gCinema.Key.CinemaName,
                        Address = gCinema.Key.CinemaAddress,
                        Showtimes = gCinema.OrderBy(s => s.StartTime).ToList()
                    }).ToList()
            }).ToList(),
        Reviews           = reviews?.ToList() ?? [],
        AverageRating     = reviews?.Any() == true ? reviews.Average(r => r.Rating) : 0.0,
        ReviewCount       = reviews?.Count() ?? 0
    };
}
