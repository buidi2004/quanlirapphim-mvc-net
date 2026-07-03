using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ContactService(IContactRepository contactRepository) : IContactService
{
    public async Task<(IEnumerable<dynamic> Contacts, int TotalPages)> GetAllContactsAsync(int page = 1, int pageSize = 10)
    {
        int totalCount = await contactRepository.GetTotalCountAsync();
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        int offset = (page - 1) * pageSize;

        var contacts = await contactRepository.GetAllContactsAsync(pageSize, offset);
        return (contacts, totalPages);
    }

    public async Task<int> CreateContactAsync(dynamic contact)
    {
        return await contactRepository.CreateContactAsync(contact);
    }

    public async Task<dynamic?> GetContactByIdAsync(int id)
    {
        return await contactRepository.GetContactByIdAsync(id);
    }

    public async Task ReplyToContactAsync(int id, string replyMessage)
    {
        await contactRepository.UpdateReplyAsync(id, replyMessage, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
    }

    public async Task DeleteContactAsync(int id)
    {
        await contactRepository.DeleteAsync(id);
    }
}
