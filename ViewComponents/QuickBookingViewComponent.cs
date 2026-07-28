using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.ViewComponents;

// QuickBookingViewComponent: Component giao diện tái sử dụng (Reusable UI Component)
// Nhiệm vụ: Tải danh sách các phim đang chiếu để hiển thị thanh "Đặt Vé Nhanh" (Quick Booking Bar) ở trang chủ hoặc cuối các trang.
// ViewComponent giúp tách bạch logic tải dữ liệu ra khỏi Controller chính và View chính, tuân thủ nguyên lý Don't Repeat Yourself (DRY).
public class QuickBookingViewComponent(IMovieService movieService) : ViewComponent
{
    // Hàm InvokeAsync tự động được ASP.NET Core Razor Engine gọi khi trong View có thẻ <vc:quick-booking /> hoặc @await Component.InvokeAsync("QuickBooking")
    public async Task<IViewComponentResult> InvokeAsync()
    {
        // Lấy danh sách phim đang chiếu từ MovieService
        var nowShowing = await movieService.GetNowShowingAsync();
        
        // Trả về Partial View tương ứng nằm trong thư mục Views/Shared/Components/QuickBooking/Default.cshtml
        return View(nowShowing);
    }
}
