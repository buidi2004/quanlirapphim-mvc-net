using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CinemaXNet.Application.Interfaces;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/contacts")]
public class AdminContactsController(IContactService contactService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1)
    {
        int pageSize = 10;
        var result = await contactService.GetAllContactsAsync(page, pageSize);
        ViewBag.CurrentPage = page;
        ViewBag.TotalPages = result.TotalPages;
        return View("~/Views/Admin/Contacts/Index.cshtml", result.Contacts);
    }

    [HttpGet("details/{id}")]
    public async Task<IActionResult> Details(int id)
    {
        var contact = await contactService.GetContactByIdAsync(id);
        if (contact == null)
        {
            return NotFound();
        }
        return View("~/Views/Admin/Contacts/Details.cshtml", contact);
    }

    [HttpPost("reply")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Reply(int id, string replyMessage)
    {
        try
        {
            await contactService.ReplyToContactAsync(id, replyMessage);
            
            TempData["Success"] = "Đã lưu phản hồi thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Details), new { id = id });
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await contactService.DeleteContactAsync(id);
            TempData["Success"] = "Đã xóa liên hệ!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
