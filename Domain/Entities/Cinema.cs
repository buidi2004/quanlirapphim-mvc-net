namespace CinemaXNet.Domain.Entities;

// Cinema Entity: Đại diện cho Bảng rạp chiếu phim (cinemas) trong Database
public class Cinema
{
    public int Id { get; set; }
    public string Name { get; set; } = "";          // Tên rạp (Ví dụ: CinemaX Quận 1)
    public string Slug { get; set; } = "";          // Chuỗi URL chuẩn SEO (Ví dụ: cinemax-quan-1)
    public string Province { get; set; } = "";      // Tỉnh / Thành phố
    public string District { get; set; } = "";      // Quận / Huyện
    public string Address { get; set; } = "";       // Tên đường, số nhà
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public double? Latitude { get; set; }           // Tọa độ vĩ độ GPS
    public double? Longitude { get; set; }          // Tọa độ kinh độ GPS
    public string? ImageUrl { get; set; }
    public string OpeningHours { get; set; } = "08:00 - 23:30"; // Giờ mở cửa
    public string? Description { get; set; }
    public string? Facilities { get; set; }         // Danh sách tiện ích dạng chuỗi (Ví dụ: "IMAX,Dolby Atmos,Bãi đỗ ô tô")
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Thuộc tính tính toán khoảng cách GPS (không lưu trực tiếp trong DB)
    public double? Distance { get; set; }

    // Trả về địa chỉ đầy đủ (Số nhà, Quận, Tỉnh)
    public string GetFullAddress() => $"{Address}, {District}, {Province}";

    // Phân tách chuỗi tiện ích thành Danh sách List<string>
    public List<string> GetFacilityList() =>
        string.IsNullOrWhiteSpace(Facilities)
            ? []
            : [.. Facilities.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];

    // Lấy ảnh rạp (trả về ảnh placeholder đẹp nếu chưa có ảnh)
    public string GetImageUrl() =>
        ImageUrl ?? "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop";
}
