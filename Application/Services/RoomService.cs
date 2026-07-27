using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class RoomService(IRoomRepository repository) : IRoomService
{
    public Task<(IEnumerable<Room> Items, int TotalCount)> GetPagedRoomsAsync(int page, int pageSize) => repository.GetPagedRoomsAsync(page, pageSize);
    public Task<IEnumerable<Cinema>> GetAllCinemasAsync() => repository.GetAllCinemasAsync();
    public Task<Room?> GetByIdAsync(int id) => repository.GetByIdAsync(id);
    public Task AddAsync(Room room) => repository.AddAsync(room);
    public Task UpdateAsync(Room room) => repository.UpdateAsync(room);
    public Task DeleteAsync(int id) => repository.DeleteAsync(id);
    public Task UpdateLayoutAsync(int id, string layoutJson) => repository.UpdateLayoutAsync(id, layoutJson);
}
