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
            // MySQL TINYINT(1) trả về int 0 hoặc 1 qua Dapper:
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
