using System.Data;
using Dapper;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Infrastructure.Repositories;

public class FoodBeverageRepository(IDbConnection db) : IFoodBeverageRepository
{
    public async Task<(IEnumerable<FoodBeverage> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;
        var countSql = "SELECT COUNT(*) FROM food_beverages";
        var totalCount = await db.ExecuteScalarAsync<int>(countSql);

        var sql = "SELECT id as Id, name as Name, description as Description, price as Price, image_url as ImageUrl, stock_quantity as StockQuantity FROM food_beverages ORDER BY id DESC LIMIT @PageSize OFFSET @Offset";
        var items = await db.QueryAsync<FoodBeverage>(sql, new { PageSize = pageSize, Offset = offset });

        return (items, totalCount);
    }

    public async Task<FoodBeverage?> GetByIdAsync(int id)
    {
        var sql = "SELECT id as Id, name as Name, description as Description, price as Price, image_url as ImageUrl, stock_quantity as StockQuantity FROM food_beverages WHERE id = @Id";
        return await db.QueryFirstOrDefaultAsync<FoodBeverage>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(FoodBeverage foodBeverage)
    {
        var sql = "INSERT INTO food_beverages (name, description, price, image_url, stock_quantity) VALUES (@Name, @Description, @Price, @ImageUrl, @StockQuantity)";
        return await db.ExecuteAsync(sql, foodBeverage);
    }

    public async Task<int> UpdateAsync(FoodBeverage foodBeverage)
    {
        var sql = @"UPDATE food_beverages SET 
                    name = @Name, description = @Description, price = @Price, stock_quantity = @StockQuantity,
                    image_url = COALESCE(@ImageUrl, image_url) 
                    WHERE id = @Id";
        return await db.ExecuteAsync(sql, foodBeverage);
    }

    public async Task<int> DeleteAsync(int id)
    {
        return await db.ExecuteAsync("DELETE FROM food_beverages WHERE id = @Id", new { Id = id });
    }
}
