namespace CinemaXNet.Models.Domain;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = ""; // bcrypt — KHÔNG bao giờ expose ra View
    public string Role { get; set; } = "user";     // 'admin' | 'user'
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Profile fields
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? DateOfBirth { get; set; }
    public string Gender { get; set; } = "other";
    public string? City { get; set; }
    public string MemberLevel { get; set; } = "bronze";
    public decimal TotalSpent { get; set; }
    public int LoyaltyPoints { get; set; }

    // Password reset
    public string? ResetToken { get; set; }
    public string? ResetTokenExpiry { get; set; }

    public bool IsAdmin => Role == "admin";

    public string GetDisplayName() => FullName ?? Username;

    public string GetAvatarUrl() =>
        AvatarUrl ?? $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(GetDisplayName())}";

    public string GetMemberLevelBadgeClass() => MemberLevel switch
    {
        "silver"  => "badge bg-secondary",
        "gold"    => "badge bg-warning text-dark",
        "diamond" => "badge bg-info text-dark",
        _         => "badge bg-danger"
    };

    public string GetMemberLevelLabel() => MemberLevel switch
    {
        "silver"  => "Bạc",
        "gold"    => "Vàng",
        "diamond" => "Kim cương",
        _         => "Đồng"
    };
}
