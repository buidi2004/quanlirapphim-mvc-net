// RoomService: Service xu ly cac logic nghiep vu (Business Logic) cho Room
﻿using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class RoomService(IRoomRepository repository) : IRoomService
{
    // Xử lý logic và luồng thực thi cho phương thức Items
    public Task<(IEnumerable<Room> Items, int TotalCount)> GetPagedRoomsAsync(int page, int pageSize) => repository.GetPagedRoomsAsync(page, pageSize);
    public Task<IEnumerable<Cinema>> GetAllCinemasAsync() => repository.GetAllCinemasAsync();
    public Task<Room?> GetByIdAsync(int id) => repository.GetByIdAsync(id);
    // Xử lý logic và luồng thực thi cho phương thức AddAsync
    public Task AddAsync(Room room) => repository.AddAsync(room);
    public Task UpdateAsync(Room room) => repository.UpdateAsync(room);
    public Task DeleteAsync(int id) => repository.DeleteAsync(id);
    // Xử lý logic và luồng thực thi cho phương thức UpdateLayoutAsync
    public Task UpdateLayoutAsync(int id, string layoutJson) => repository.UpdateLayoutAsync(id, layoutJson);
}
