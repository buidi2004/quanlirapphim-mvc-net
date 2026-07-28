namespace CinemaXNet.Domain.Entities;

// Room Entity: Đại diện cho Bảng phòng chiếu phim (rooms) trong Database
public class Room
{
    public int Id { get; set; }
    public int CinemaId { get; set; } = 1;      // Khóa ngoại liên kết Rạp chiếu
    public string Name { get; set; } = "";       // Tên phòng chiếu (Ví dụ: Phòng 01 - IMAX)
    public int TotalRows { get; set; }          // Tổng số hàng ghế (Ví dụ: 10 hàng từ A -> J)
    public int SeatsPerRow { get; set; }        // Số ghế trên mỗi hàng (Ví dụ: 12 ghế/hàng)
    public string? LayoutJson { get; set; }     // Cấu hình sơ đồ ghế đặc thù dạng JSON
    
    public Cinema? Cinema { get; set; }

    // Tính toán tổng số ghế trong phòng chiếu (Tổng hàng * Số ghế mỗi hàng)
    public int GetTotalSeats() => TotalRows * SeatsPerRow;
}
