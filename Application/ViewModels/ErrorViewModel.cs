namespace CinemaXNet.Application.ViewModels;

// ErrorViewModel: Chứa thông tin mã lỗi để hiển thị ra trang báo lỗi toàn cục (Error.cshtml)
public class ErrorViewModel
{
    // RequestId: Mã định vết của HTTP Request bị lỗi (giúp Developer tra cứu log hệ thống dễ dàng)
    public string? RequestId { get; set; }

    // ShowRequestId: Cờ kiểm tra xem có RequestId hay không để hiển thị ra giao diện
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}