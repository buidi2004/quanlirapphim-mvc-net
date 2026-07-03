namespace CinemaXNet.Application.Interfaces;

public interface IContactRepository
{
    Task<IEnumerable<dynamic>> GetAllContactsAsync(int limit, int offset);
    Task<int> CreateContactAsync(dynamic contact);
    Task<dynamic?> GetContactByIdAsync(int id);
    Task UpdateReplyAsync(int id, string replyMessage, string repliedAt);
    Task DeleteAsync(int id);
    Task<int> GetTotalCountAsync();
}
