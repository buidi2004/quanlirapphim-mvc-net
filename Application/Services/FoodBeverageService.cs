using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Services;

public class FoodBeverageService(IFoodBeverageRepository repository) : IFoodBeverageService
{
    public async Task<(IEnumerable<FoodBeverage> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
    {
        return await repository.GetPagedAsync(page, pageSize);
    }

    public async Task<FoodBeverage?> GetByIdAsync(int id)
    {
        return await repository.GetByIdAsync(id);
    }

    public async Task<int> AddAsync(FoodBeverage foodBeverage)
    {
        return await repository.AddAsync(foodBeverage);
    }

    public async Task<int> UpdateAsync(FoodBeverage foodBeverage)
    {
        return await repository.UpdateAsync(foodBeverage);
    }

    public async Task<int> DeleteAsync(int id)
    {
        return await repository.DeleteAsync(id);
    }
}
