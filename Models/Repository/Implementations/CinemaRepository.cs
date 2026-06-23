using System.Data;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Repository.Interfaces;
using Dapper;

namespace CinemaXNet.Models.Repository.Implementations;

public class CinemaRepository(IDbConnection db) : ICinemaRepository
{
    private const string BaseSelect = @"
        SELECT id, name, slug, province, district, address, phone, email,
               latitude, longitude, image_url AS ImageUrl, opening_hours AS OpeningHours,
               description, facilities, is_active AS IsActive, created_at AS CreatedAt
        FROM cinemas WHERE is_active = 1";

    public async Task<IEnumerable<Cinema>> GetAllAsync(string? province = null)
    {
        if (province != null)
        {
            var sql = BaseSelect + " AND province = @province ORDER BY name";
            return await db.QueryAsync<Cinema>(sql, new { province });
        }
        return await db.QueryAsync<Cinema>(BaseSelect + " ORDER BY province, name");
    }

    public async Task<IEnumerable<string>> GetAllProvincesAsync()
    {
        const string sql = "SELECT DISTINCT province FROM cinemas WHERE is_active = 1 ORDER BY province";
        return await db.QueryAsync<string>(sql);
    }

    public async Task<Cinema?> FindBySlugAsync(string slug)
    {
        var sql = BaseSelect + " AND slug = @slug";
        return await db.QueryFirstOrDefaultAsync<Cinema>(sql, new { slug });
    }

    public async Task<IEnumerable<Cinema>> FindNearestAsync(double lat, double lng, int limit = 3)
    {
        // SQLite doesn't have native spatial functions, calculate distance in memory
        var all = await GetAllAsync();
        return all
            .Where(c => c.Latitude.HasValue && c.Longitude.HasValue)
            .Select(c =>
            {
                c.Distance = HaversineDistance(lat, lng, c.Latitude!.Value, c.Longitude!.Value);
                return c;
            })
            .OrderBy(c => c.Distance)
            .Take(limit);
    }

    /// <summary>Tính khoảng cách Haversine (km) giữa 2 tọa độ GPS.</summary>
    private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // km
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;
}
