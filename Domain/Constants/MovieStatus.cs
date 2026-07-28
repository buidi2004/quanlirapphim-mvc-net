namespace CinemaXNet.Domain.Constants;

// MovieStatus: Định nghĩa các Hằng số về Trạng thái bộ phim trong hệ thống
public static class MovieStatus
{
    public const string NowShowing = "now_showing"; // Phim đang được chiếu tại rạp
    public const string ComingSoon = "coming_soon"; // Phim sắp ra mắt (cho phép xem Trailer, chưa mở bán vé hoặc sắp mở)
}
