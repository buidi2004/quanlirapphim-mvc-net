using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IRoomService
{
    Task<(IEnumerable<Room> Items, int TotalCount)> GetPagedRoomsAsync(int page, int pageSize);
    Task<IEnumerable<Cinema>> GetAllCinemasAsync();
    Task<Room?> GetByIdAsync(int id);
    Task AddAsync(Room room);
    Task UpdateAsync(Room room);
    Task DeleteAsync(int id);
    Task UpdateLayoutAsync(int id, string layoutJson);
}
