// ContactRepository: Repository dam nhan cac thao tac truy van Database cho Contact
﻿using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class ContactRepository(IDbConnection db) : IContactRepository
{
    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetAllContactsAsync
    public async Task<IEnumerable<dynamic>> GetAllContactsAsync(int limit, int offset)
    {
        var sql = "SELECT * FROM contacts ORDER BY created_at DESC LIMIT @Limit OFFSET @Offset";
        return await db.QueryAsync<dynamic>(sql, new { Limit = limit, Offset = offset });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetTotalCountAsync
    public async Task<int> GetTotalCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM contacts");
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức GetContactByIdAsync
    public async Task<dynamic?> GetContactByIdAsync(int id)
    {
        return await db.QuerySingleOrDefaultAsync<dynamic>("SELECT * FROM contacts WHERE id = @Id", new { Id = id });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức CreateContactAsync
    public async Task<int> CreateContactAsync(dynamic contact)
    {
        var sql = @"
            INSERT INTO contacts (name, email, phone, subject, message, status)
            VALUES (@name, @email, @phone, @subject, @message, 'pending');
            SELECT LAST_INSERT_ID();";
        return await db.QuerySingleAsync<int>(sql, (object)contact);
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức UpdateReplyAsync
    public async Task UpdateReplyAsync(int id, string replyMessage, string repliedAt)
    {
        var sql = "UPDATE contacts SET status = 'replied', reply_message = @ReplyMessage, replied_at = @RepliedAt, is_read = 1 WHERE id = @Id";
        await db.ExecuteAsync(sql, new { ReplyMessage = replyMessage, RepliedAt = repliedAt, Id = id });
    }

    // Thực thi câu lệnh SQL thao tác CSDL cho phương thức DeleteAsync
    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM contacts WHERE id = @Id", new { Id = id });
    }
}
