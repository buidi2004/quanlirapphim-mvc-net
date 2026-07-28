using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

// [Route("cinemas")]: Cấu hình URL mặc định cho toàn bộ Controller này
[Route("cinemas")]
// CinemaController: Đảm nhận các chức năng liên quan đến việc tìm kiếm Rạp chiếu phim, định vị rạp và xem lịch chiếu toàn hệ thống.
public class CinemaController(ICinemaService cinemaService) : Controller
{
    // Hành động lấy danh sách toàn bộ rạp (có thể lọc theo Tỉnh/Thành)
    // GET /cinemas
    [HttpGet("")]
    public async Task<IActionResult> Index(string? province = null)
    {
        // 1. Lấy danh sách rạp, truyền vào tham số province (nếu người dùng không chọn thì province = null, sẽ lấy hết rạp)
        var cinemas   = await cinemaService.GetAllAsync(province);
        
        // 2. Lấy danh sách các tỉnh/thành có rạp để hiển thị lên thanh Menu Dropdown (Bộ lọc)
        var provinces = await cinemaService.GetAllProvincesAsync();

        ViewBag.Cinemas          = cinemas;
        ViewBag.Provinces        = provinces;
        ViewBag.SelectedProvince = province;
        ViewBag.PageTitle        = "Hệ thống rạp — CinemaX";
        return View();
    }

    // Hành động hiển thị lịch chiếu chung trên TOÀN QUỐC (chọn theo ngày)
    // GET /cinemas/showtimes
    [HttpGet("showtimes")]
    public async Task<IActionResult> GlobalShowtimes(string? date = null)
    {
        // Phân tích tham số date. Nếu không có hoặc lỗi định dạng, sẽ lấy ngày hiện tại (Today)
        var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        
        // Gọi service lấy danh sách lịch chiếu của toàn bộ các rạp trong ngày đó
        var showtimes = await cinemaService.GetGlobalShowtimesByDateAsync(showDate);
        
        ViewBag.ShowDate = showDate;
        ViewBag.Showtimes = showtimes;
        ViewBag.PageTitle = "Lịch chiếu toàn quốc — CinemaX";
        return View();
    }

    // Hành động hiển thị chi tiết một RẠP CỤ THỂ theo chuỗi đường dẫn (Slug). VD: /cinemas/cinemax-quan-1
    // GET /cinemas/{slug}
    [HttpGet("{slug}")]
    public async Task<IActionResult> Detail(string slug, string? date = null)
    {
        try
        {
            // Lấy thông tin rạp bằng slug (chuỗi dễ đọc trên URL thay vì dùng ID)
            var cinema = await cinemaService.GetBySlugAsync(slug);
            var showDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
            
            // Lấy lịch chiếu của riêng rạp này
            var showtimes = await cinemaService.GetShowtimesByDateAsync(cinema.Id, showDate);
            
            ViewBag.ShowDate = showDate;
            // Gom nhóm lịch chiếu theo Phim (Group By Movie) để giao diện hiển thị gọn gàng (Tên Phim -> Các khung giờ)
            ViewBag.Showtimes = showtimes.GroupBy(s => s.Movie).ToList();
            ViewBag.PageTitle = $"{cinema.Name} — CinemaX";
            
            return View(cinema);
        }
        catch (NotFoundException)
        {
            // Nếu không tìm thấy slug trong Database, quăng ra NotFoundException từ Service, và Controller sẽ trả về trang báo lỗi 404.
            return NotFound();
        }
    }

    // API Hỗ trợ tính năng "Tìm rạp gần tôi nhất" sử dụng GPS định vị của người dùng.
    // [HttpGet("/api/cinemas/nearest")]: Được gọi từ AJAX (Javascript) dưới dạng JSON, ghi đè Route thành "/api/..."
    [HttpGet("/api/cinemas/nearest")]
    public async Task<IActionResult> Nearest(double? lat, double? lng)
    {
        // 1. Nếu client không gửi lên tọa độ vĩ độ (lat) hoặc kinh độ (lng), báo lỗi 400 Bad Request
        if (!lat.HasValue || !lng.HasValue)
            return BadRequest(new { error = "Thiếu tham số lat hoặc lng" });

        try
        {
            // 2. Lấy 3 rạp gần nhất so với tọa độ GPS của người dùng (Thuật toán tính khoảng cách Haversine chạy trong Database)
            var cinemas = await cinemaService.FindNearestAsync(lat.Value, lng.Value, 3);
            
            // 3. Đóng gói dữ liệu ra định dạng chuỗi JSON nhẹ nhất (Select các cột cần thiết)
            var result = cinemas.Select(c => new
            {
                id       = c.Id,
                name     = c.Name,
                slug     = c.Slug,
                province = c.Province,
                address  = c.GetFullAddress(),
                distance = Math.Round(c.Distance ?? 0, 1), // Làm tròn khoảng cách (ví dụ 1.2 km)
                imageUrl = c.GetImageUrl()
            });
            
            // 4. Trả về cho Javascript hiển thị lên bản đồ hoặc danh sách
            return Json(new { success = true, data = result });
        }
        catch (Exception)
        {
            // Lỗi hệ thống sẽ trả về 500 Internal Server Error
            return StatusCode(500, new { error = "Lỗi server khi tìm rạp gần nhất" });
        }
    }
}
