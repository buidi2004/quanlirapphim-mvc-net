// MovieService: Service xu ly cac logic nghiep vu (Business Logic) cho Movie
﻿using System.Data;
using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using CinemaXNet.Domain.Constants;
using Dapper;

namespace CinemaXNet.Application.Services;

public class MovieService(
    IMovieRepository movieRepo,
    IShowtimeRepository showtimeRepo,
    ITicketRepository ticketRepo,
    IDynamicPricingService pricingService) : IMovieService
{
    // Xử lý logic và luồng thực thi cho phương thức GetNowShowingAsync
    public Task<IEnumerable<Movie>> GetNowShowingAsync() =>
        movieRepo.GetFilteredAsync(null, MovieStatus.NowShowing);

    // Xử lý logic và luồng thực thi cho phương thức GetComingSoonAsync
    public Task<IEnumerable<Movie>> GetComingSoonAsync() =>
        movieRepo.GetFilteredAsync(null, MovieStatus.ComingSoon);

    // Xử lý logic và luồng thực thi cho phương thức GetFilteredAsync
    public Task<IEnumerable<Movie>> GetFilteredAsync(string? genre, string status) =>
        movieRepo.GetFilteredAsync(genre, status);

    // Xử lý logic và luồng thực thi cho phương thức GetFilteredPaginatedAsync
    public Task<PaginatedList<Movie>> GetFilteredPaginatedAsync(string? genre, string status, int pageIndex, int pageSize) =>
        movieRepo.GetFilteredPaginatedAsync(genre, status, pageIndex, pageSize);

    // Xử lý logic và luồng thực thi cho phương thức GetAllAsync
    public Task<IEnumerable<Movie>> GetAllAsync() =>
        movieRepo.GetAllAsync();

    // Xử lý logic và luồng thực thi cho phương thức GetAllPaginatedAsync
    public Task<PaginatedList<Movie>> GetAllPaginatedAsync(int pageIndex, int pageSize) =>
        movieRepo.GetAllPaginatedAsync(pageIndex, pageSize);

    // Xử lý logic và luồng thực thi cho phương thức SearchMoviesAsync
    public Task<IEnumerable<Movie>> SearchMoviesAsync(string query, string? genre) =>
        movieRepo.SearchMoviesAsync(query, genre);

    // Xử lý logic và luồng thực thi cho phương thức GetDetailAsync
    public async Task<Movie> GetDetailAsync(int movieId)
    {
        var movie = await movieRepo.FindByIdAsync(movieId);
        return movie ?? throw new NotFoundException($"Không tìm thấy phim với ID {movieId}");
    }

    // Xử lý logic và luồng thực thi cho phương thức GetShowtimesByDateAsync
    public async Task<IEnumerable<ShowtimeSummary>> GetShowtimesByDateAsync(int movieId, DateOnly date)
    {
        var showtimes = (await showtimeRepo.GetByMovieAndDateAsync(movieId, date)).ToList();
        if (!showtimes.Any()) return new List<ShowtimeSummary>();

        var showtimeIds = showtimes.Select(s => s.Id).ToList();
        var activeTicketCounts = await ticketRepo.GetActiveTicketCountsAsync(showtimeIds);
        var dynamicPrices = await pricingService.CalculatePricesAsync(showtimes);

        var summaries = new List<ShowtimeSummary>();

        foreach (var showtime in showtimes)
        {
            var activeCount = activeTicketCounts.TryGetValue(showtime.Id, out var cnt) ? cnt : 0;
            var totalSeats  = showtime.Room!.GetTotalSeats();

            var dynamicPrice = dynamicPrices.TryGetValue(showtime.Id, out var price) ? price : showtime.Price;
            showtime.Price = dynamicPrice;

            summaries.Add(new ShowtimeSummary
            {
                Id             = showtime.Id,
                CinemaId       = showtime.Room?.CinemaId ?? 0,
                CinemaName     = showtime.Room?.Cinema?.Name ?? "",
                CinemaAddress  = showtime.Room?.Cinema?.Address ?? "",
                Province       = showtime.Room?.Cinema?.Province ?? "Khác",
                ShowDate       = showtime.ShowDate,
                StartTime      = showtime.StartTime,
                EndTime        = showtime.EndTime,
                Price          = dynamicPrice,
                FormattedPrice = showtime.GetFormattedPrice(),
                RoomName       = showtime.Room?.Name ?? "",
                Format         = showtime.Format,
                AvailableSeats = Math.Max(0, totalSeats - activeCount)
            });
        }
        return summaries;
    }

    // Xử lý logic và luồng thực thi cho phương thức GetSeatMapViewModelAsync
    public async Task<SeatMapViewModel> GetSeatMapViewModelAsync(int showtimeId)
    {
        var showtime = await showtimeRepo.FindByIdAsync(showtimeId)
            ?? throw new NotFoundException($"Không tìm thấy suất chiếu với ID {showtimeId}");

        var seatStatuses = await ticketRepo.GetActiveTicketsAsync(showtimeId);

        return new SeatMapViewModel
        {
            ShowtimeId   = showtime.Id,
            MovieTitle   = showtime.Movie!.Title,
            CinemaName   = showtime.Room!.Cinema?.Name ?? "CinemaX",
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
    // Xử lý logic và luồng thực thi cho phương thức CreateMovieAsync
    public Task<int> CreateMovieAsync(CinemaXNet.Domain.Entities.Movie movie) =>
        movieRepo.CreateAsync(movie);

    // Xử lý logic và luồng thực thi cho phương thức UpdateMovieAsync
    public Task<int> UpdateMovieAsync(int id, CinemaXNet.Domain.Entities.Movie movie) =>
        movieRepo.UpdateAsync(id, movie);

    // Xử lý logic và luồng thực thi cho phương thức DeleteMovieAsync
    public async Task<int> DeleteMovieAsync(int id)
    {
        if (await ticketRepo.HasActiveTicketsForMovieAsync(id))
            throw new BusinessException("Không thể xóa phim này vì đã có vé được thanh toán.");
        return await movieRepo.DeleteAsync(id);
    }
}
