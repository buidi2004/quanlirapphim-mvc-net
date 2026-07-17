using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class RoomRepository(IDbConnection db) : IRoomRepository
{
    public async Task<(IEnumerable<Room> Items, int TotalCount)> GetPagedRoomsAsync(int page, int pageSize)
    {
        var offset = (page - 1) * pageSize;

        var countSql = "SELECT COUNT(*) FROM rooms";
        var totalCount = await db.ExecuteScalarAsync<int>(countSql);

        var sql = @"
            SELECT r.id, r.cinema_id AS CinemaId, r.name, r.total_rows AS TotalRows, r.seats_per_row AS SeatsPerRow, r.layout_json AS LayoutJson,
                   c.id, c.name, c.province, c.district, c.address
            FROM rooms r
            JOIN cinemas c ON r.cinema_id = c.id
            ORDER BY r.id DESC
            LIMIT @PageSize OFFSET @Offset
        ";

        var rooms = await db.QueryAsync<Room, Cinema, Room>(
            sql,
            (room, cinema) =>
            {
                room.Cinema = cinema;
                return room;
            },
            new { Offset = offset, PageSize = pageSize },
            splitOn: "id"
        );

        return (rooms, totalCount);
    }

    public async Task<IEnumerable<Cinema>> GetAllCinemasAsync()
    {
        return await db.QueryAsync<Cinema>("SELECT id, name FROM cinemas ORDER BY name");
    }

    public async Task<Room?> GetByIdAsync(int id)
    {
        return await db.QueryFirstOrDefaultAsync<Room>(
            "SELECT id, cinema_id AS CinemaId, name, total_rows AS TotalRows, seats_per_row AS SeatsPerRow, layout_json AS LayoutJson FROM rooms WHERE id = @Id", 
            new { Id = id });
    }

    public async Task AddAsync(Room room)
    {
        var sql = "INSERT INTO rooms (cinema_id, name, total_rows, seats_per_row) VALUES (@CinemaId, @Name, @TotalRows, @SeatsPerRow)";
        await db.ExecuteAsync(sql, room);
    }

    public async Task UpdateAsync(Room room)
    {
        var sql = "UPDATE rooms SET cinema_id = @CinemaId, name = @Name, total_rows = @TotalRows, seats_per_row = @SeatsPerRow WHERE id = @Id";
        await db.ExecuteAsync(sql, room);
    }

    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM rooms WHERE id = @Id", new { Id = id });
    }

    public async Task UpdateLayoutAsync(int id, string layoutJson)
    {
        await db.ExecuteAsync("UPDATE rooms SET layout_json = @LayoutJson WHERE id = @Id", new { Id = id, LayoutJson = layoutJson });
    }
}
