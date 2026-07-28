using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

// HomeController: Chịu trách nhiệm xử lý các trang dành cho người dùng cuối (Khách hàng) ở ngoài trang chủ.
// Controller này kế thừa từ Controller (hỗ trợ trả về View HTML), khác với ControllerBase (chỉ trả về JSON dùng cho API).
// Ở đây sử dụng cú pháp Primary Constructor của C# 12 để tiêm (inject) IMovieService và IBannerService trực tiếp.
public class HomeController(IMovieService movieService, IBannerService bannerService) : Controller
{
    // Hành động (Action) Index() xử lý khi người dùng truy cập vào trang chủ: GET / hoặc GET /Home/Index
    public async Task<IActionResult> Index()
    {
        // 1. Lấy danh sách phim đang chiếu và sắp chiếu từ Database thông qua MovieService.
        // Dùng Service để không phải viết SQL trực tiếp ở đây.
        var nowShowing = await movieService.GetNowShowingAsync();
        var comingSoon = await movieService.GetComingSoonAsync();

        // 2. Dữ liệu Khuyến mãi tạm thời đang được Mock (giả lập) cứng ở dạng List.
        // Trong thực tế, đoạn này sau này sẽ được thay bằng: await promotionService.GetActivePromotionsAsync()
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

        // 3. Tương tự, tin tức hiện cũng đang được Mock giả lập dữ liệu cứng để hiển thị giao diện trước.
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

        // 4. Lấy danh sách Banners đang hoạt động (hiển thị trên slider ở trang chủ)
        var banners = await bannerService.GetActiveBannersAsync();

        // 5. Gói tất cả dữ liệu vào ViewBag để truyền từ Controller sang View (trang HTML)
        // Lưu ý: Có thể dùng ViewModel Strongly-typed thay vì ViewBag để an toàn hơn về kiểu dữ liệu (Type-safe).
        ViewBag.NowShowing  = nowShowing;
        ViewBag.ComingSoon  = comingSoon;
        ViewBag.Promotions  = promotions;
        ViewBag.News        = news;
        ViewBag.Banners     = banners;
        ViewBag.PageTitle   = "CinemaX — Đặt vé trực tuyến";
        
        // 6. Trả về View tương ứng (mặc định sẽ là file Views/Home/Index.cshtml)
        return View();
    }

    // Action xử lý lỗi toàn cục. 
    // Đường dẫn này được cấu hình ở file Program.cs (app.UseStatusCodePagesWithReExecute("/error/{0}"))
    [Route("/error/{statusCode}")]
    public IActionResult Error(int statusCode)
    {
        ViewBag.StatusCode = statusCode;
        
        // Nếu lỗi 404 (Không tìm thấy trang), trả về giao diện Error404 riêng rẽ
        if (statusCode == 404)
        {
            ViewBag.PageTitle = "Không tìm thấy trang — CinemaX";
            return View("Error404");
        }
        
        // Các lỗi khác (như 500 Lỗi Server) sẽ trả về giao diện Error500 chung
        ViewBag.PageTitle = "Lỗi hệ thống — CinemaX";
        return View("Error500");
    }
}
