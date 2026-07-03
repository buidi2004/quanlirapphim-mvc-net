using Microsoft.AspNetCore.Http;

namespace CinemaXNet.Application.Interfaces;

public interface INewsService
{
    Task<(IEnumerable<dynamic> NewsList, int TotalPages)> GetAllNewsAsync(int page = 1, int pageSize = 10);
    Task AddNewsAsync(string title, string excerpt, string content, IFormFile? image);
    Task UpdateNewsAsync(int id, string title, string excerpt, string content, IFormFile? image);
    Task DeleteNewsAsync(int id);
}
