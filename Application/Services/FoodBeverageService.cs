// FoodBeverageService: Service xu ly cac logic nghiep vu (Business Logic) cho FoodBeverage
﻿using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Application.Services;

public class FoodBeverageService(IFoodBeverageRepository repository) : IFoodBeverageService
{
    // Xử lý logic và luồng thực thi cho phương thức Items
    public async Task<(IEnumerable<FoodBeverage> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
    {
        return await repository.GetPagedAsync(page, pageSize);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetByIdAsync
    public async Task<FoodBeverage?> GetByIdAsync(int id)
    {
        return await repository.GetByIdAsync(id);
    }

    // Xử lý logic và luồng thực thi cho phương thức AddAsync
    public async Task<int> AddAsync(FoodBeverage foodBeverage)
    {
        return await repository.AddAsync(foodBeverage);
    }

    // Xử lý logic và luồng thực thi cho phương thức UpdateAsync
    public async Task<int> UpdateAsync(FoodBeverage foodBeverage)
    {
        return await repository.UpdateAsync(foodBeverage);
    }

    // Xử lý logic và luồng thực thi cho phương thức DeleteAsync
    public async Task<int> DeleteAsync(int id)
    {
        return await repository.DeleteAsync(id);
    }
}
