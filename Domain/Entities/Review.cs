using System;

namespace CinemaXNet.Domain.Entities;

// Review Entity: Đại diện cho Bảng Đánh giá & Bình luận Phim (reviews) trong Database
public class Review
{
    public int Id { get; set; }
    public int MovieId { get; set; }                 // Khóa ngoại liên kết Phim
    public int UserId { get; set; }                  // Khóa ngoại liên kết Khán giả viết bình luận
    public int Rating { get; set; }                  // Số sao đánh giá từ 1 đến 5 sao
    public string Comment { get; set; } = "";        // Nội dung bình luận
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties cho phép Dapper JOIN dữ liệu User & Movie
    public User? User { get; set; }
    public Movie? Movie { get; set; }
}
