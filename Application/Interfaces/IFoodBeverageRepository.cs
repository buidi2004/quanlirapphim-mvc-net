using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Interfaces;

public interface IFoodBeverageRepository
{
    Task<(IEnumerable<FoodBeverage> Items, int TotalCount)> GetPagedAsync(int page, int pageSize);
    Task<int> AddAsync(FoodBeverage foodBeverage);
    Task<int> UpdateAsync(FoodBeverage foodBeverage);
    Task<int> DeleteAsync(int id);
}
