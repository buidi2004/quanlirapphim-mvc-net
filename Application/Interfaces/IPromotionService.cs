using CinemaXNet.Domain.ValueObjects;
using CinemaXNet.Application.ViewModels;
using System.Threading.Tasks;

namespace CinemaXNet.Application.Interfaces;

public interface IPromotionService
{
    Task<PromotionResult> ApplyPromotionAsync(string code, decimal subtotal);
    Task<bool> ValidateCodeAsync(string code);
    Task<PaginatedList<dynamic>> GetPaginatedAsync(int page, int pageSize);
    Task CreateAsync(dynamic promotion);
    Task UpdateAsync(dynamic promotion);
    Task DeleteAsync(int id);
}
