namespace CinemaXNet.Application.Interfaces;

public interface IContactService
{
    Task<(IEnumerable<dynamic> Contacts, int TotalPages)> GetAllContactsAsync(int page = 1, int pageSize = 10);
    Task<int> CreateContactAsync(dynamic contact);
    Task<dynamic?> GetContactByIdAsync(int id);
    Task ReplyToContactAsync(int id, string replyMessage);
    Task DeleteContactAsync(int id);
}
