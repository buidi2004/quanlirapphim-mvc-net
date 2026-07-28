using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.ViewModels;

// ShowtimeSummary: Đóng gói tóm tắt 1 suất chiếu (Gồm thông tin rạp, giờ chiếu, phòng chiếu, giá vé)
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

// Gom nhóm các suất chiếu theo từng Rạp
public class CinemaShowtimeGroup
{
    public string CinemaName { get; set; } = "";
    public string Address { get; set; } = "";
    public List<ShowtimeSummary> Showtimes { get; set; } = [];
}

// Gom nhóm các Rạp theo từng Tỉnh/Thành phố (Tầng nhóm cấp cao nhất)
public class ProvinceShowtimeGroup
{
    public string Province { get; set; } = "";
    public List<CinemaShowtimeGroup> Cinemas { get; set; } = [];
}

// MovieDetailViewModel: ViewModel tổng hợp hiển thị toàn bộ trang Chi tiết Phim (/movies/1)
// Bao gồm: Thông tin phim, Danh sách Đánh giá, và Hệ thống Lịch chiếu đã phân loại theo Tỉnh -> Rạp -> Giờ chiếu
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
    public string? Director { get; set; }
    public string? Cast { get; set; }
    public string? TrailerUrl { get; set; }
    public List<ShowtimeSummary> Showtimes { get; set; } = [];
    public List<ProvinceShowtimeGroup> GroupedShowtimes { get; set; } = [];
    public List<Review> Reviews { get; set; } = [];
    public double AverageRating { get; set; } = 0.0;
    public int ReviewCount { get; set; } = 0;

    // Static Factory Method: Hàm tiện ích giúp ánh xạ (Map) dữ liệu từ Entity + Lịch chiếu + Bình luận sang ViewModel
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
        Director          = movie.Director,
        Cast              = movie.Cast,
        TrailerUrl        = movie.TrailerUrl,
        Showtimes         = showtimes.ToList(),
        
        // Thuật toán LINQ GroupBy Lồng Nhau (Nested GroupBy):
        // 1. Cấp 1: Gom suất chiếu theo Tỉnh/Thành (gProv.Key = Province)
        // 2. Cấp 2: Trong mỗi Tỉnh, gom suất chiếu theo từng Rạp (gCinema.Key = CinemaName)
        // 3. Cấp 3: Sắp xếp các suất chiếu trong rạp theo thứ tự giờ chiếu tăng dần (10:00 -> 13:30 -> 20:00)
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
            
        // Tính toán số sao trung bình (Ví dụ: 4.5/5 sao) và số lượng bình luận
        Reviews           = reviews?.ToList() ?? [],
        AverageRating     = reviews?.Any() == true ? reviews.Average(r => r.Rating) : 0.0,
        ReviewCount       = reviews?.Count() ?? 0
    };
}
