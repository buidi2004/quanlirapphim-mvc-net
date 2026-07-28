using CinemaXNet.Domain.Exceptions;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers;

// [Authorize]: Yêu cầu toàn bộ các Action trong Controller này phải đăng nhập mới được vào (Trừ khi có [AllowAnonymous] chặn lại)
[Authorize]
[Route("booking")]
// BookingController: Xử lý luồng đặt vé: Chọn ghế -> Bán đồ ăn -> Thanh toán.
public class BookingController(
    ITicketService ticketService,
    IMovieService movieService,
    IPromotionService promotionService,
    ICinemaService cinemaService,
    CinemaXNet.Application.Interfaces.IShowtimeRepository showtimeRepo) : Controller
{
    // Màn hình 1: Hiển thị sơ đồ ghế (Seat Map)
    // [AllowAnonymous]: Cho phép khách chưa đăng nhập cũng xem được sơ đồ ghế.
    [AllowAnonymous]
    [HttpGet("seats")]
    public async Task<IActionResult> SeatMap([FromQuery] int showtimeId)
    {
        // Lấy toàn bộ thông tin sơ đồ ghế, trạng thái ghế (Trống, Đã đặt, Đang giữ) từ Service
        var seatMapVm = await movieService.GetSeatMapViewModelAsync(showtimeId);
        return View(seatMapVm);
    }

    // Xử lý khi người dùng ấn nút "Tiếp tục" sau khi chọn ghế xong
    // POST /booking/hold
    [AllowAnonymous]
    [HttpPost("hold")]
    [ValidateAntiForgeryToken] // Chống CSRF
    public async Task<IActionResult> HoldSeats([FromForm] int showtimeId, [FromForm] List<string> seatCodes, [FromForm] string? guestEmail, [FromForm] string? guestPhone)
    {
        if (seatCodes.Count == 0)
            return Json(new { success = false, error = "Vui lòng chọn ít nhất 1 ghế." });

        int? userId = null;
        // Kiểm tra xem User đã đăng nhập chưa
        if (User.Identity?.IsAuthenticated == true)
        {
            userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }
        else if (string.IsNullOrWhiteSpace(guestEmail) || string.IsNullOrWhiteSpace(guestPhone))
        {
            // Nếu chưa đăng nhập thì bắt buộc phải nhập Email & SĐT khách vãng lai
            return Json(new { success = false, error = "Vui lòng đăng nhập hoặc nhập thông tin khách." });
        }

        try
        {
            // 1. Gọi TicketService để khóa ghế (HoldSeats). Hàm này sẽ kiểm tra xem ghế có ai mua chưa.
            var holdResult = await ticketService.HoldSeatsAsync(userId, showtimeId, seatCodes, guestEmail, guestPhone);
            
            // 2. Lưu danh sách ID vé vừa tạo tạm vào Session để mang sang trang tiếp theo (bán bắp nước / thanh toán)
            HttpContext.Session.SetString("pending_ticket_ids",
                System.Text.Json.JsonSerializer.Serialize(holdResult.TicketIds));

            // Trả về JSON để Ajax (Javascript) tự động chuyển trang sang /booking/concessions
            return Json(new
            {
                success            = true,
                redirectUrl        = "/booking/concessions",
                expiryTime         = holdResult.ExpiryTime,
                remainingSeconds   = holdResult.GetRemainingSeconds() // Thời gian đếm ngược (ví dụ 10 phút)
            });
        }
        catch (SeatUnavailableException ex) // Lỗi ghế đã có người mua nhanh tay hơn
        {
            return StatusCode(409, new { success = false, error = ex.Message });
        }
        catch (BusinessException ex) // Các lỗi nghiệp vụ khác
        {
            return StatusCode(422, new { success = false, error = ex.Message });
        }
    }

    // Màn hình 2: Bán bắp nước (Concessions)
    [AllowAnonymous]
    [HttpGet("concessions")]
    public IActionResult Concessions()
    {
        // Đọc vé đang giữ từ Session. Nếu không có (người dùng copy link bay thẳng vào) thì đá về trang chủ
        var ticketIdsJson = HttpContext.Session.GetString("pending_ticket_ids");
        if (string.IsNullOrEmpty(ticketIdsJson)) return Redirect("/");

        return View();
    }

    // Xử lý lưu bắp nước người dùng chọn
    [AllowAnonymous]
    [HttpPost("save-concessions")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức SaveConcessions
    public IActionResult SaveConcessions([FromForm] string? concessionsData)
    {
        if (!string.IsNullOrEmpty(concessionsData))
        {
            // Lưu dữ liệu bắp nước vào Session
            HttpContext.Session.SetString("selected_concessions", concessionsData);
        }
        else
        {
            HttpContext.Session.Remove("selected_concessions");
        }
        // Chuyển sang màn hình Thanh toán
        return Redirect("/payment");
    }

    // API Hỗ trợ áp dụng Mã Khuyến Mãi (Gọi qua AJAX ở màn hình thanh toán)
    [AllowAnonymous]
    [HttpPost("apply-promo")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức ApplyPromo
    public async Task<IActionResult> ApplyPromo([FromForm] string code, [FromForm] decimal subtotal)
    {
        try
        {
            // Tính toán giảm giá bằng PromotionService
            var result = await promotionService.ApplyPromotionAsync(code, subtotal);
            return Json(new
            {
                success    = true,
                discount   = result.Discount,
                totalPrice = result.TotalPrice
            });
        }
        catch (BusinessException ex) // Lỗi mã hết hạn, không tồn tại
        {
            return StatusCode(422, new { success = false, error = ex.Message });
        }
    }

    // Màn hình Đặt vé nhanh (Hiển thị form chọn Phim -> Rạp -> Ngày -> Giờ chiếu)
    [AllowAnonymous]
    [HttpGet("fast")]
    public async Task<IActionResult> Fast()
    {
        ViewBag.PageTitle = "Mua Vé Nhanh — CinemaX";
        var movies = await movieService.GetNowShowingAsync();
        var cinemas = await cinemaService.GetAllAsync();
        ViewBag.Movies = movies;
        ViewBag.Cinemas = cinemas;
        return View();
    }

    // ── Các API nội bộ phục vụ cho Dropdown của trang Đặt vé nhanh ──
    [AllowAnonymous]
    [HttpGet("/api/quickbooking/cinemas")]
    public async Task<IActionResult> GetCinemasForMovie([FromQuery] int movieId)
    {
        var cinemas = await cinemaService.GetAllAsync();
        return Json(cinemas.Select(c => new { id = c.Id, name = c.Name }));
    }

    [AllowAnonymous]
    [HttpGet("/api/quickbooking/dates")]
    // Xử lý logic và luồng thực thi cho phương thức GetDatesForMovieAndCinema
    public IActionResult GetDatesForMovieAndCinema([FromQuery] int movieId, [FromQuery] int cinemaId)
    {
        var dates = new List<object>();
        for(int i=0; i<7; i++) {
            var d = DateTime.Today.AddDays(i);
            dates.Add(new { value = d.ToString("yyyy-MM-dd"), formatted = d.ToString("dd/MM/yyyy") });
        }
        return Json(dates);
    }

    [AllowAnonymous]
    [HttpGet("/api/quickbooking/showtimes")]
    // Xử lý logic và luồng thực thi cho phương thức GetShowtimes
    public async Task<IActionResult> GetShowtimes([FromQuery] int movieId, [FromQuery] int cinemaId, [FromQuery] string date)
    {
        var d = DateOnly.Parse(date);
        var showtimes = await showtimeRepo.GetByCinemaAndDateAsync(cinemaId, d);
        // Lọc lấy suất chiếu đúng phim đó và sắp xếp theo giờ chiếu tăng dần
        var filtered = showtimes.Where(s => s.MovieId == movieId).OrderBy(s => s.StartTime).ToList();

        return Json(filtered.Select(s => new { id = s.Id, time = s.StartTime }));
    }
}
