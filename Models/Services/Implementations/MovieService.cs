using System.Data;
using CinemaXNet.Core.Exceptions;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.ViewModels;
using Dapper;

namespace CinemaXNet.Models.Services.Implementations;

public class MovieService(
    IMovieRepository movieRepo,
    IShowtimeRepository showtimeRepo,
    ITicketRepository ticketRepo,
    IDynamicPricingService pricingService,
    IDbConnection db) : IMovieService
{
    public Task<IEnumerable<Movie>> GetNowShowingAsync() =>
        movieRepo.GetFilteredAsync(null, "now_showing");

    public Task<IEnumerable<Movie>> GetComingSoonAsync() =>
        movieRepo.GetFilteredAsync(null, "coming_soon");

    public Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status) =>
        movieRepo.GetFilteredAsync(genre, status);

    public Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize) =>
        movieRepo.GetFilteredPaginatedAsync(genre, status, pageIndex, pageSize);

    public Task<IEnumerable<Movie>> GetAllAsync() =>
        movieRepo.GetAllAsync();

    public Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize) =>
        movieRepo.GetAllPaginatedAsync(pageIndex, pageSize);

    public async Task<Movie> GetDetailAsync(int movieId)
    {
        var movie = await movieRepo.FindByIdAsync(movieId);
        return movie ?? throw new NotFoundException($"Không tìm thấy phim với ID {movieId}");
    }

    public async Task<IEnumerable<ShowtimeSummary>> GetShowtimesByDateAsync(int movieId, DateOnly date)
    {
        var showtimes = await showtimeRepo.GetByMovieAndDateAsync(movieId, date);
        var summaries = new List<ShowtimeSummary>();

        foreach (var showtime in showtimes)
        {
            var activeTickets = await ticketRepo.GetActiveTicketsAsync(showtime.Id);
            var totalSeats    = showtime.Room!.GetTotalSeats();

            var dynamicPrice = await pricingService.CalculatePriceAsync(showtime);
            showtime.Price = dynamicPrice;

            summaries.Add(new ShowtimeSummary
            {
                Id             = showtime.Id,
                ShowDate       = showtime.ShowDate,
                StartTime      = showtime.StartTime,
                FormattedPrice = showtime.GetFormattedPrice(),
                RoomName       = showtime.Room.Name,
                AvailableSeats = Math.Max(0, totalSeats - activeTickets.Count)
            });
        }
        return summaries;
    }

    public async Task<SeatMapViewModel> GetSeatMapViewModelAsync(int showtimeId)
    {
        var showtime = await showtimeRepo.FindByIdAsync(showtimeId)
            ?? throw new NotFoundException($"Không tìm thấy suất chiếu với ID {showtimeId}");

        var seatStatuses = await ticketRepo.GetActiveTicketsAsync(showtimeId);

        return new SeatMapViewModel
        {
            ShowtimeId   = showtime.Id,
            MovieTitle   = showtime.Movie!.Title,
            ShowDate     = showtime.ShowDate,
            StartTime    = showtime.StartTime,
            RoomName     = showtime.Room!.Name,
            PricePerSeat = await pricingService.CalculatePriceAsync(showtime),
            TotalRows    = showtime.Room.TotalRows,
            SeatsPerRow  = showtime.Room.SeatsPerRow,
            LayoutJson   = showtime.Room.LayoutJson,
            SeatStatuses = new Dictionary<string, string>(seatStatuses)
        };
    }

    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        var movieCount  = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM movies");
        var userCount   = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM users WHERE role = 'user'");
        var ticketCount = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM tickets WHERE status = 'paid'");
        var revenue     = await db.ExecuteScalarAsync<decimal>("SELECT COALESCE(SUM(total_price), 0) FROM tickets WHERE status = 'paid'");

        return new DashboardStats
        {
            MovieCount  = movieCount,
            UserCount   = userCount,
            TicketCount = ticketCount,
            Revenue     = revenue
        };
    }

    public Task<int> CreateMovieAsync(CinemaXNet.Models.Domain.Movie movie) =>
        movieRepo.CreateAsync(movie);

    public Task<int> UpdateMovieAsync(int id, CinemaXNet.Models.Domain.Movie movie) =>
        movieRepo.UpdateAsync(id, movie);

    public Task<int> DeleteMovieAsync(int id) =>
        movieRepo.DeleteAsync(id);
}
