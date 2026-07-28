namespace CinemaXNet.Domain.Entities;

// Showtime Entity: Đại diện cho Bảng suất chiếu (showtimes) trong Database
public class Showtime
{
    public int Id { get; set; }
    public int MovieId { get; set; }                 // Khóa ngoại liên kết Phim
    public int RoomId { get; set; }                  // Khóa ngoại liên kết Phòng chiếu
    public DateOnly ShowDate { get; set; }           // Ngày chiếu (VD: 2026-07-28)
    public TimeOnly StartTime { get; set; }          // Giờ bắt đầu chiếu (VD: 19:30)
    public string Format { get; set; } = "2D Phụ đề"; // Định dạng chiếu (2D Phụ đề, 3D Lồng tiếng, IMAX...)
    public TimeOnly? EndTime { get; set; }           // Giờ kết thúc suất chiếu
    public decimal Price { get; set; }               // Giá vé gốc của suất chiếu này
    public DateTime CreatedAt { get; set; }

    // Thông tin liên kết (Eager Loading)
    public Movie? Movie { get; set; }
    public Room? Room { get; set; }

    // Định dạng giá tiền ra chuỗi hiển thị đẹp mắt (VD: 100,000₫)
    public string GetFormattedPrice() =>
        Price.ToString("N0") + "₫";
}
