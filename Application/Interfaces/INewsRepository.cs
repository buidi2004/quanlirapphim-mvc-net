namespace CinemaXNet.Application.Interfaces;

public interface INewsRepository
{
    Task<IEnumerable<dynamic>> GetAllAsync(int offset, int limit);
    Task<int> GetTotalCountAsync();
    Task AddAsync(string title, string slug, string excerpt, string content, string? imageUrl);
    Task UpdateAsync(int id, string title, string slug, string excerpt, string content, string? imageUrl);
    Task DeleteAsync(int id);
}
