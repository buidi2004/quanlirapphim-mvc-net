using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ReviewService(IReviewRepository reviewRepository) : IReviewService
{
    public async Task<(IEnumerable<dynamic> Reviews, int TotalPages)> GetAllReviewsAsync(int page = 1, int pageSize = 10)
    {
        int totalCount = await reviewRepository.GetTotalReviewsCountAsync();
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        int offset = (page - 1) * pageSize;

        var reviews = await reviewRepository.GetAllReviewsAsync(offset, pageSize);
        return (reviews, totalPages);
    }

    public async Task<(bool Success, string Message)> ToggleReviewStatusAsync(int id)
    {
        var review = await reviewRepository.GetReviewByIdAsync(id);
        if (review != null)
        {
            // In SQLite, bool is stored as 1/0 or true/false depending on the driver, but typically int 0 or 1.
            // Assuming it's numeric in this DB:
            bool currentStatus = review.is_approved == 1 || review.is_approved == true || review.is_approved == "1";
            bool newStatus = !currentStatus;
            await reviewRepository.ToggleStatusAsync(id, newStatus);
            return (true, newStatus ? "Đã duyệt đánh giá!" : "Đã ẩn đánh giá!");
        }
        return (false, "Không tìm thấy đánh giá.");
    }

    public async Task DeleteReviewAsync(int id)
    {
        await reviewRepository.DeleteReviewAsync(id);
    }
}
