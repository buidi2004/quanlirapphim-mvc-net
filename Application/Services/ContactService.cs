// ContactService: Service xu ly cac logic nghiep vu (Business Logic) cho Contact
﻿using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Application.Services;

public class ContactService(IContactRepository contactRepository) : IContactService
{
    // Xử lý logic và luồng thực thi cho phương thức Contacts
    public async Task<(IEnumerable<dynamic> Contacts, int TotalPages)> GetAllContactsAsync(int page = 1, int pageSize = 10)
    {
        int totalCount = await contactRepository.GetTotalCountAsync();
        int totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        if (totalPages == 0) totalPages = 1;
        int offset = (page - 1) * pageSize;

        var contacts = await contactRepository.GetAllContactsAsync(pageSize, offset);
        return (contacts, totalPages);
    }

    // Xử lý logic và luồng thực thi cho phương thức CreateContactAsync
    public async Task<int> CreateContactAsync(dynamic contact)
    {
        return await contactRepository.CreateContactAsync(contact);
    }

    // Xử lý logic và luồng thực thi cho phương thức GetContactByIdAsync
    public async Task<dynamic?> GetContactByIdAsync(int id)
    {
        return await contactRepository.GetContactByIdAsync(id);
    }

    // Xử lý logic và luồng thực thi cho phương thức ReplyToContactAsync
    public async Task ReplyToContactAsync(int id, string replyMessage)
    {
        await contactRepository.UpdateReplyAsync(id, replyMessage, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
    }

    // Xử lý logic và luồng thực thi cho phương thức DeleteContactAsync
    public async Task DeleteContactAsync(int id)
    {
        await contactRepository.DeleteAsync(id);
    }
}
