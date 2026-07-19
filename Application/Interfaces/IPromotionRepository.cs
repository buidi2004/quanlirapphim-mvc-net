using CinemaXNet.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface IPromotionRepository
{
    Task<Promotion?> FindByCodeAsync(string code);
    Task<IEnumerable<dynamic>> GetAllAsync(int limit, int offset);
    Task<int> GetCountAsync();
    Task CreateAsync(dynamic promotion);
    Task UpdateAsync(dynamic promotion);
    Task DeleteAsync(int id);
}
