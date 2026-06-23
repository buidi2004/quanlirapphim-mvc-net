using CinemaXNet.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Route("news")]
public class NewsController : Controller
{
    private static readonly List<NewsItemViewModel> MockArticles =
    [
        new() {
            Title="Review Dune Part 2: Cảnh Tượng Nghẹt Thở Tại Hành Tinh Cát",
            Slug="review-dune-part-2", Category="Góc Điện Ảnh",
            ImageUrl="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
            Summary="Siêu phẩm điện ảnh của Denis Villeneuve tiếp tục chứng minh sức mạnh thị giác vô tiền khoáng hậu tại định dạng IMAX.",
            PublishedAt=DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") },
        new() {
            Title="Top 5 Phim Việt Nam Đáng Xem Nhất Hiện Tại",
            Slug="top-5-phim-viet-nam", Category="Top List",
            ImageUrl="https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop",
            Summary="Điểm danh những bộ phim chiếu rạp làm mưa làm gió tại phòng vé Việt trong những ngày vừa qua.",
            PublishedAt=DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss") },
        new() {
            Title="Christopher Nolan Hé Lộ Dự Án Mới Về Đề Tài Vũ Trụ",
            Slug="christopher-nolan-du-an-moi", Category="Tin Hollywood",
            ImageUrl="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format&fit=crop",
            Summary="Sau thành công vang dội của Oppenheimer, vị đạo diễn kiệt xuất dự kiến sẽ quay lại thể loại Sci-Fi sở trường.",
            PublishedAt=DateTime.Now.AddDays(-2).ToString("yyyy-MM-dd HH:mm:ss") },
        new() {
            Title="Những Bộ Phim Hoạt Hình Hay Nhất Năm 2025 Dành Cho Cả Nhà",
            Slug="phim-hoat-hinh-hay-2025", Category="Gia Đình",
            ImageUrl="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
            Summary="Năm 2025 mang đến hàng loạt siêu phẩm hoạt hình đáng xem cho khán giả mọi lứa tuổi.",
            PublishedAt=DateTime.Now.AddDays(-3).ToString("yyyy-MM-dd HH:mm:ss") },
    ];

    // GET /news
    [HttpGet("")]
    public IActionResult Index()
    {
        ViewBag.Featured  = MockArticles.First();
        ViewBag.Articles  = MockArticles;
        ViewBag.PageTitle = "Tin tức — CinemaX";
        return View();
    }

    // GET /news/{slug}
    [HttpGet("{slug}")]
    public IActionResult Detail(string slug)
    {
        var article = MockArticles.FirstOrDefault(a => a.Slug == slug);
        if (article == null) return NotFound();

        ViewBag.Article   = article;
        ViewBag.Related   = MockArticles.Where(a => a.Slug != slug).Take(3).ToList();
        ViewBag.PageTitle = $"{article.Title} — CinemaX";
        return View();
    }
}
