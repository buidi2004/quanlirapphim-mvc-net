// IBannerRepository: Interface dinh nghia cac phuong thuc Hop dong cho IBanner
﻿namespace CinemaXNet.Application.Interfaces;

public interface IBannerRepository
{
    Task<IEnumerable<dynamic>> GetAllAsync();
    Task<IEnumerable<dynamic>> GetActiveAsync();
    Task<int> GetTotalCountAsync();
    Task<dynamic?> GetByIdAsync(int id);
    Task AddAsync(string title, string? description, string? imageUrl, string? linkUrl, int sortOrder, bool isActive);
    Task UpdateAsync(int id, string title, string? description, string? imageUrl, string? linkUrl, int sortOrder, bool isActive);
    Task DeleteAsync(int id);
}
