using CinemaXNet.Models.Services.Interfaces;
using CinemaXNet.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

public class HomeController(IMovieService movieService) : Controller
{
    // GET /
    public async Task<IActionResult> Index()
    {
        var nowShowing = await movieService.GetNowShowingAsync();
        var comingSoon = await movieService.GetComingSoonAsync();

        // Mock promotions (same as PHP)
        var promotions = new List<PromotionItemViewModel>
        {
            new() { Id=1, Code="SUMMER2026", DiscountType="percent", DiscountValue=20, MaxUses=1000, UsedCount=50,
                    ExpiresAt=DateTime.Today.AddDays(30).ToString("yyyy-MM-dd"),
                    ImageUrl="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" },
            new() { Id=2, Code="VALENTINE",  DiscountType="percent", DiscountValue=15, MaxUses=500,  UsedCount=10,
                    ExpiresAt=DateTime.Today.AddDays(15).ToString("yyyy-MM-dd"),
                    ImageUrl="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop" },
            new() { Id=3, Code="TUESDAY",    DiscountType="fixed",   DiscountValue=50000, MaxUses=null, UsedCount=200,
                    ExpiresAt=DateTime.Today.AddDays(90).ToString("yyyy-MM-dd"),
                    ImageUrl="https://images.unsplash.com/photo-1440407876336-62333a6f010f?q=80&w=800&auto=format&fit=crop" },
        };

        // Mock news
        var news = new List<NewsItemViewModel>
        {
            new() { Title="Review Dune Part 2: Cảnh Tượng Nghẹt Thở Tại Hành Tinh Cát",
                    Slug="review-dune-part-2", Category="Góc Điện Ảnh",
                    ImageUrl="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
                    Summary="Siêu phẩm điện ảnh của Denis Villeneuve tiếp tục chứng minh sức mạnh thị giác vô tiền khoáng hậu tại định dạng IMAX." },
            new() { Title="Top 5 Phim Việt Nam Đáng Xem Nhất Hiện Tại",
                    Slug="top-5-phim-viet-nam", Category="Top List",
                    ImageUrl="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop",
                    Summary="Điểm danh những bộ phim chiếu rạp làm mưa làm gió tại phòng vé Việt trong những ngày vừa qua." },
            new() { Title="Christopher Nolan Hé Lộ Dự Án Mới Về Đề Tài Vũ Trụ",
                    Slug="christopher-nolan-du-an-moi", Category="Tin Hollywood",
                    ImageUrl="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop",
                    Summary="Sau thành công vang dội của Oppenheimer, vị đạo diễn kiệt xuất dự kiến sẽ quay lại thể loại Sci-Fi sở trường." },
        };

        ViewBag.NowShowing  = nowShowing;
        ViewBag.ComingSoon  = comingSoon;
        ViewBag.Promotions  = promotions;
        ViewBag.News        = news;
        ViewBag.PageTitle   = "CinemaX — Đặt vé trực tuyến";
        return View();
    }

    [Route("/error/{statusCode}")]
    public IActionResult Error(int statusCode)
    {
        ViewBag.StatusCode = statusCode;
        if (statusCode == 404)
        {
            ViewBag.PageTitle = "Không tìm thấy trang — CinemaX";
            return View("Error404");
        }
        
        ViewBag.PageTitle = "Lỗi hệ thống — CinemaX";
        return View("Error500");
    }
}
