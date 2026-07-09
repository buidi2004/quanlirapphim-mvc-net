using System.ComponentModel;
using ModelContextProtocol.Server;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;
using System.Text.Json;

namespace CinemaXNet.Infrastructure.MCP
{
    [McpServerToolType]
    public class CinemaMcpTools
    {
        private readonly IMovieService _movieService;

        public CinemaMcpTools(IMovieService movieService)
        {
            _movieService = movieService;
        }

        [McpServerTool, Description("Lấy danh sách các bộ phim đang được chiếu tại rạp. Trả về thông tin phim (ID, Tên, Thể loại, Thời lượng) dưới định dạng JSON.")]
        public async Task<string> GetNowShowingMovies()
        {
            try
            {
                var movies = await _movieService.GetNowShowingAsync();
                if (movies == null || !movies.Any())
                {
                    return "Không có phim nào đang chiếu.";
                }
                
                // Return a simplified JSON for AI to read easily
                var result = movies.Select(m => new {
                    m.Id,
                    m.Title,
                    m.Genre,
                    m.DurationMinutes,
                    m.AgeRating
                });
                
                return JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Lỗi khi lấy danh sách phim: {ex.Message}";
            }
        }

        [McpServerTool, Description("Tìm kiếm phim theo từ khóa tên phim (keyword). Trả về danh sách phim khớp với từ khóa dưới định dạng JSON.")]
        public async Task<string> SearchMovies(string keyword)
        {
            try
            {
                var movies = await _movieService.SearchMoviesAsync(keyword, null);
                if (movies == null || !movies.Any())
                {
                    return $"Không tìm thấy phim nào khớp với từ khóa '{keyword}'.";
                }
                
                var result = movies.Select(m => new {
                    m.Id,
                    m.Title,
                    m.Genre,
                    m.Status
                });
                
                return JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
            }
            catch (Exception ex)
            {
                return $"Lỗi khi tìm kiếm phim: {ex.Message}";
            }
        }

        [McpServerTool, Description("Thay thế toàn bộ danh sách phim hiện tại bằng các bộ phim chiếu rạp Việt Nam thịnh hành (Lật Mặt 7, Mai, Đào Phở và Piano, vv) dùng ảnh thật.")]
        public async Task<string> InjectVNMovies()
        {
            try
            {
                // Delete all old movies
                var oldMovies = await _movieService.GetAllAsync();
                foreach(var m in oldMovies)
                {
                    await _movieService.DeleteMovieAsync(m.Id);
                }

                // Add new VN movies
                var movies = new List<Movie>
                {
                    new Movie { Title = "Lật Mặt 7: Một Điều Ước", Genre = "Gia đình, Tâm lý", DurationMinutes = 138, Status = "now_showing", AgeRating = "K", PosterUrl = "/images/movies/lat-mat-7.jpg", Director = "Lý Hải", Cast = "Thanh Hiền, Trương Minh Cường, Đinh Y Nhung, Quách Ngọc Tuyên, Trâm Anh", Description = "Bà Hai (73 tuổi) có 5 người con trưởng thành. Một biến cố xảy ra khiến những người con phải đối mặt với khó khăn khi phải chăm sóc mẹ già." },
                    new Movie { Title = "Mai", Genre = "Tâm lý, Tình cảm", DurationMinutes = 131, Status = "now_showing", AgeRating = "T18", PosterUrl = "/images/movies/mai.jpg", Director = "Trấn Thành", Cast = "Phương Anh Đào, Tuấn Trần, Trấn Thành, Hồng Đào", Description = "Câu chuyện về Mai, một người phụ nữ 37 tuổi làm nghề mát xa có số phận éo le và mối tình chị em đầy nước mắt với Dương." },
                    new Movie { Title = "Đào, Phở và Piano", Genre = "Lịch sử, Chiến tranh", DurationMinutes = 100, Status = "now_showing", AgeRating = "C13", PosterUrl = "/images/movies/dao-pho-piano.jpg", Director = "Phi Tiến Sơn", Cast = "Doãn Quốc Đam, Cao Thị Thùy Linh, Trần Lực, Trung Hiếu", Description = "Lấy bối cảnh 60 ngày đêm bảo vệ Hà Nội cuối năm 1946, kể về tinh thần quả cảm của những người dân thủ đô." },
                    new Movie { Title = "Kẻ Ẩn Danh", Genre = "Hành động, Võ thuật", DurationMinutes = 94, Status = "coming_soon", AgeRating = "C16", PosterUrl = "/images/movies/ke-an-danh.jpg", Director = "Trần Trọng Dần", Cast = "Kiều Minh Tuấn, Quốc Trường, Mạc Văn Khoa", Description = "Một tay giang hồ rửa tay gác kiếm phải quay lại con đường cũ để bảo vệ gia đình." },
                    new Movie { Title = "Người Vợ Cuối Cùng", Genre = "Tâm lý, Cổ trang", DurationMinutes = 132, Status = "ended", AgeRating = "T18", PosterUrl = "/images/movies/nguoi-vo-cuoi-cung.jpg", Director = "Victor Vũ", Cast = "Kaity Nguyễn, Thuận Nguyễn, NSƯT Kim Oanh, Đinh Ngọc Diệp", Description = "Cuộc đời nhiều thăng trầm của Linh - người vợ lẽ của một quan tri huyện thời phong kiến." }
                };

                foreach(var m in movies)
                {
                    await _movieService.CreateMovieAsync(m);
                }

                return "Đã xóa toàn bộ phim cũ và tiêm thành công 5 bộ phim Việt Nam thịnh hành (ảnh thật).";
            }
            catch (Exception ex)
            {
                return $"Lỗi khi tiêm phim VN: {ex.Message}";
            }
        }
    }
}
