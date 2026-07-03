using System.Data;
using CinemaXNet.Application.Interfaces;
using Dapper;

namespace CinemaXNet.Infrastructure.Repositories;

public class ContactRepository(IDbConnection db) : IContactRepository
{
    public async Task<IEnumerable<dynamic>> GetAllContactsAsync(int limit, int offset)
    {
        var sql = "SELECT * FROM contacts ORDER BY created_at DESC LIMIT @Limit OFFSET @Offset";
        return await db.QueryAsync<dynamic>(sql, new { Limit = limit, Offset = offset });
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM contacts");
    }

    public async Task<dynamic?> GetContactByIdAsync(int id)
    {
        return await db.QuerySingleOrDefaultAsync<dynamic>("SELECT * FROM contacts WHERE id = @Id", new { Id = id });
    }

    public async Task<int> CreateContactAsync(dynamic contact)
    {
        var sql = @"
            INSERT INTO contacts (name, email, phone, subject, message, status)
            VALUES (@name, @email, @phone, @subject, @message, 'pending');
            SELECT last_insert_rowid();";
        return await db.QuerySingleAsync<int>(sql, (object)contact);
    }

    public async Task UpdateReplyAsync(int id, string replyMessage, string repliedAt)
    {
        var sql = "UPDATE contacts SET status = 'replied', reply_message = @ReplyMessage, replied_at = @RepliedAt, is_read = 1 WHERE id = @Id";
        await db.ExecuteAsync(sql, new { ReplyMessage = replyMessage, RepliedAt = repliedAt, Id = id });
    }

    public async Task DeleteAsync(int id)
    {
        await db.ExecuteAsync("DELETE FROM contacts WHERE id = @Id", new { Id = id });
    }
}
