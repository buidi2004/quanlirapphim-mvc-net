using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/contacts")]
public class AdminContactsController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var sql = "SELECT * FROM contacts ORDER BY created_at DESC";
        var contacts = await db.QueryAsync<dynamic>(sql);
        return View("~/Views/Admin/Contacts/Index.cshtml", contacts);
    }

    [HttpPost("reply")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Reply(int id, string replyMessage)
    {
        try
        {
            var sql = "UPDATE contacts SET status = 'replied', reply_message = @ReplyMessage, replied_at = @RepliedAt WHERE id = @Id";
            await db.ExecuteAsync(sql, new { ReplyMessage = replyMessage, RepliedAt = DateTime.Now, Id = id });
            
            // Here you would typically send an email to the user using an email service
            // e.g. await _emailService.SendEmailAsync(contact.Email, "Trả lời liên hệ", replyMessage);

            TempData["Success"] = "Đã lưu phản hồi thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await db.ExecuteAsync("DELETE FROM contacts WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Đã xóa liên hệ!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
