namespace CinemaXNet.Domain.Entities;

// User Entity: Đại diện cho Bảng người dùng (users) trong Database
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = ""; // Chuỗi mật khẩu đã mã hóa Bcrypt — BẢO MẬT: KHÔNG bao giờ gửi ra View!
    public string Role { get; set; } = "user";     // Phân quyền: 'admin' | 'user' | 'cinema_manager' | 'staff'
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Thông tin Hồ sơ cá nhân (Profile)
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? DateOfBirth { get; set; }
    public string Gender { get; set; } = "other";
    public string? City { get; set; }
    public string MemberLevel { get; set; } = "bronze"; // Cấp độ thành viên: 'bronze' (Đồng), 'silver' (Bạc), 'gold' (Vàng), 'diamond' (Kim Cương)
    public decimal TotalSpent { get; set; }             // Tổng số tiền đã chi tiêu (VNĐ)
    public int LoyaltyPoints { get; set; }              // Điểm thưởng tích lũy

    // Token Đặt lại mật khẩu
    public string? ResetToken { get; set; }
    public string? ResetTokenExpiry { get; set; }

    // Refresh Token cho JWT App Mobile
    public string? RefreshToken { get; set; }
    public string? RefreshTokenExpiry { get; set; }

    public bool IsAdmin => Role == "admin";

    // Trả về Tên hiển thị (Ưu tiên Họ tên đầy đủ, nếu chưa nhập thì lấy Username)
    public string GetDisplayName() => FullName ?? Username;

    // Lấy Ảnh đại diện (Nếu không có sẽ tạo Avatar chữ cái tự động từ DiceBear)
    public string GetAvatarUrl() =>
        AvatarUrl ?? $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(GetDisplayName())}";

    // Trả về CSS Class Badge cho cấp độ thành viên
    public string GetMemberLevelBadgeClass() => MemberLevel switch
    {
        "silver"  => "badge bg-secondary",
        "gold"    => "badge bg-warning text-dark",
        "diamond" => "badge bg-info text-dark",
        _         => "badge bg-danger"
    };

    // Trả về Tên hiển thị tiếng Việt của Cấp độ thành viên
    public string GetMemberLevelLabel() => MemberLevel switch
    {
        "silver"  => "Bạc",
        "gold"    => "Vàng",
        "diamond" => "Kim cương",
        _         => "Đồng"
    };
}
