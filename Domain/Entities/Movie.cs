namespace CinemaXNet.Domain.Entities;

// Movie Entity: Đại diện cho Bảng bộ phim (movies) trong Database
public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? PosterUrl { get; set; }
    public string? TrailerUrl { get; set; }
    public string? Genre { get; set; }               // Thể loại phim (Hành động, Tình cảm, Hoạt hình...)
    public string Status { get; set; } = "coming_soon"; // Trạng thái: 'now_showing' (Đang chiếu) | 'coming_soon' (Sắp chiếu) | 'ended' (Đã ngừng)
    public int DurationMinutes { get; set; }         // Thời lượng phim tính theo phút (Ví dụ: 120 phút)
    public string? Description { get; set; }
    public string? AgeRating { get; set; }           // Phân loại độ tuổi: 'P' (Mọi lứa tuổi), 'C13', 'C16', 'C18'
    public string? Director { get; set; }            // Đạo diễn
    public string? Cast { get; set; }                // Diễn viên
    public DateTime CreatedAt { get; set; }
    
    public double AverageRating { get; set; } = 0.0; // Điểm đánh giá trung bình từ khán giả (0.0 -> 5.0)
    public int ReviewCount { get; set; } = 0;        // Số lượt đánh giá

    public bool IsNowShowing => Status == "now_showing";

    // Định dạng thời lượng phim ra dạng chuỗi dễ đọc (Ví dụ: 125 phút -> "2h 5p")
    public string GetFormattedDuration()
    {
        int h = DurationMinutes / 60;
        int m = DurationMinutes % 60;
        return h > 0 ? $"{h}h {m}p" : $"{m}p";
    }
}
