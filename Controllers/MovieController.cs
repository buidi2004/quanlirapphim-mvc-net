using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaXNet.Controllers;

// [Route("movies")]: Cấu hình đường dẫn chung cho toàn bộ Controller này là "/movies"
[Route("movies")]
// MovieController: Đảm nhận việc hiển thị danh sách phim, chi tiết phim và lịch chiếu phim.
public class MovieController(IMovieService movieService, ITicketService ticketService, IReviewRepository reviewRepo) : Controller
{
    // Hành động (Action) hiển thị danh sách phim. URL: GET /movies
    [HttpGet("")]
    public async Task<IActionResult> Index(string? genre, string status = "now_showing", int page = 1)
    {
        int pageSize = 12; // Số phim tối đa trên 1 trang
        // Gọi Service lấy danh sách phim có phân trang và lọc theo Thể loại (genre) / Trạng thái (đang chiếu, sắp chiếu)
        var movies = await movieService.GetFilteredPaginatedAsync(genre, status, page, pageSize);
        
        // Truyền lại bộ lọc hiện tại qua ViewBag để View (giao diện) biết đường hiển thị nút Active tương ứng
        ViewBag.Genre  = genre;
        ViewBag.Status = status;
        
        return View(movies); // Trả về giao diện Views/Movie/Index.cshtml kèm dữ liệu movies
    }

    // Hành động hiển thị chi tiết 1 bộ phim cụ thể. URL: GET /movies/5 (ví dụ id = 5)
    // "{id:int}" đảm bảo tham số id bắt buộc phải là kiểu số nguyên, chống lỗi truyền chữ vào URL.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Detail(int id, string? date = null)
    {
        // 1. Lấy thông tin chi tiết phim từ Database
        var movie     = await movieService.GetDetailAsync(id);
        
        // 2. Phân tích ngày chiếu người dùng chọn. Nếu không chọn thì mặc định lấy ngày hôm nay.
        var showDate  = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        
        // 3. Lấy toàn bộ suất chiếu của bộ phim này trong ngày đã chọn
        var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
        
        // 4. Lấy danh sách đánh giá/bình luận của phim
        var reviews   = await reviewRepo.GetByMovieIdAsync(id);
        
        // 5. Đóng gói (Map) tất cả dữ liệu (Phim, Suất chiếu, Bình luận) vào một ViewModel tổng hợp
        // Mục đích: Giúp truyền dữ liệu sang View sạch sẽ và an toàn hơn so với dùng ViewBag.
        var viewModel = MovieDetailViewModel.FromMovie(movie, showtimes, reviews);

        ViewBag.SelectedDate = showDate; // Trợ giúp View đánh dấu ngày đang được chọn
        return View(viewModel); // Trả về Views/Movie/Detail.cshtml
    }

    // Hành động gọi qua AJAX để hiển thị Popup (Modal) đặt vé nhanh mà không cần chuyển trang
    // URL: GET /movies/5/booking-modal
    [HttpGet("{id:int}/booking-modal")]
    public async Task<IActionResult> BookingModal(int id, string? date = null)
    {
        var movie     = await movieService.GetDetailAsync(id);
        var showDate  = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);
        var showtimes = await movieService.GetShowtimesByDateAsync(id, showDate);
        
        // Không tải bình luận vì Modal này chỉ cần lịch chiếu
        var viewModel = MovieDetailViewModel.FromMovie(movie, showtimes, new List<CinemaXNet.Domain.Entities.Review>());

        ViewBag.SelectedDate = showDate;
        
        // PartialView: Trả về một phần HTML (không có thẻ bao ngoài <html><body>) để nhúng trực tiếp vào Modal Popup.
        return PartialView("_BookingModal", viewModel);
    }

    // Hành động hiển thị Lịch sử mua vé của riêng người dùng
    // [Authorize]: Yêu cầu phải Đăng nhập mới xem được. Cố tình truy cập sẽ bị đẩy ra trang Login.
    // [HttpGet("/my-tickets")]: Ghi đè Route gốc, tức là đường dẫn sẽ là "/my-tickets" chứ không phải "/movies/my-tickets"
    [Authorize]
    [HttpGet("/my-tickets")]
    public async Task<IActionResult> MyTickets()
    {
        // Lấy UserID từ JWT/Cookie Claim
        var userId  = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        // Lấy danh sách vé đã đặt
        var tickets = await ticketService.GetUserTicketsAsync(userId);
        
        ViewBag.PageTitle = "Vé của tôi";
        return View(tickets); // Trả về Views/Movie/MyTickets.cshtml
    }
}
