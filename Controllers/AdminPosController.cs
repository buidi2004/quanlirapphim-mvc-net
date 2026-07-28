using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CinemaXNet.Domain.Exceptions;

namespace CinemaXNet.Controllers;

// [Authorize]: Yêu cầu tài khoản có quyền Admin, Quản lý rạp hoặc Nhân viên quầy (staff) mới được phép sử dụng POS.
[Authorize(Roles = "admin,cinema_manager,staff")]
[Route("admin/pos")]
// AdminPosController: Chức năng Bán vé trực tiếp tại quầy (Point of Sale) dành cho Nhân viên.
public class AdminPosController(IMovieService movieService, ITicketService ticketService, IShowtimeService showtimeService) : Controller
{
    // Giao diện chính của trang POS bán vé tại quầy (GET /admin/pos)
    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        ViewBag.PageTitle = "POS Bán vé tại quầy";
        // Lấy danh sách phim đang chiếu và lịch chiếu hôm nay để load sẵn ra giao diện
        ViewBag.Movies = await movieService.GetNowShowingAsync();

        var today = DateOnly.FromDateTime(DateTime.Now);
        ViewBag.Showtimes = await showtimeService.GetAllByDateAsync(today);

        return View("~/Views/Admin/POS.cshtml");
    }

    // API: Lấy danh sách phim đang chiếu (Dùng cho Javascript tải dữ liệu động trên trang POS)
    [HttpGet("api/movies")]
    public async Task<IActionResult> GetMoviesToday()
    {
        var movies = await movieService.GetNowShowingAsync();
        return Json(movies);
    }

    // API: Lấy danh sách lịch chiếu của một bộ phim (Load 2 ngày: Hôm nay và Ngày mai)
    [HttpGet("api/showtimes/{movieId}")]
    public async Task<IActionResult> GetShowtimes(int movieId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var tomorrow = today.AddDays(1);
        
        var showtimesToday = await movieService.GetShowtimesByDateAsync(movieId, today);
        var showtimesTomorrow = await movieService.GetShowtimesByDateAsync(movieId, tomorrow);

        // Gom nhóm kết quả trả về thành dạng Dictionary { "Ngày": [Lịch chiếu 1, Lịch chiếu 2...] }
        var dict = new Dictionary<string, object>();
        if (showtimesToday.Any()) dict[today.ToString("dd/MM/yyyy")] = showtimesToday;
        if (showtimesTomorrow.Any()) dict[tomorrow.ToString("dd/MM/yyyy")] = showtimesTomorrow;

        return Json(dict);
    }

    // API: Lấy sơ đồ ghế (Trạng thái ghế) của một suất chiếu cụ thể
    [HttpGet("api/seatmap/{showtimeId}")]
    public async Task<IActionResult> GetSeatMap(int showtimeId)
    {
        var seatMapVm = await movieService.GetSeatMapViewModelAsync(showtimeId);
        return Json(seatMapVm);
    }

    // API: Thực hiện thao tác Thanh Toán Nhanh (In vé ngay lập tức tại quầy)
    [HttpPost("api/checkout")]
    public async Task<IActionResult> Checkout([FromBody] PosCheckoutRequest request)
    {
        if (request.SeatCodes == null || request.SeatCodes.Count == 0)
            return BadRequest(new { error = "Vui lòng chọn ghế." });

        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            // Ghi nhận nhân viên (tài khoản đang thao tác POS) để đánh dấu người bán vé
            userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        try
        {
            // 1. Khóa các ghế được chọn. Do là bán tại quầy, khách hàng thường chưa có tài khoản nên dùng email mặc định guest@cinemax.com.
            var holdResult = await ticketService.HoldSeatsAsync(userId, request.ShowtimeId, request.SeatCodes, "guest@cinemax.com", "0000000000");
            
            // 2. Chuyển trạng thái vé thẳng sang ĐÃ THANH TOÁN bằng tiền mặt (cash_pos). Bỏ qua bước chờ chuyển khoản.
            bool success = await ticketService.ConfirmPaymentAsync(holdResult.TicketIds, userId, "cash_pos", null, null);

            if (success)
            {
                return Json(new { success = true, message = "Thanh toán thành công!", ticketIds = holdResult.TicketIds });
            }
            return BadRequest(new { error = "Lỗi khi xác nhận thanh toán." });
        }
        catch (BusinessException ex)
        {
            // Bắt các lỗi nghiệp vụ như: Ghế vừa có khách online đặt mất, suất chiếu đã chiếu xong v.v...
            return BadRequest(new { error = ex.Message });
        }
    }
}

// Request Body gửi từ Javascript lên để thực hiện thanh toán POS
public class PosCheckoutRequest
{
    public int ShowtimeId { get; set; }
    public List<string> SeatCodes { get; set; } = new();
}