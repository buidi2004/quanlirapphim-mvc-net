using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;

namespace CinemaXNet.Controllers;

[Route("contact")]
public class ContactController(IDbConnection db) : Controller
{
    // GET /contact
    [HttpGet("")]
    public IActionResult Index()
    {
        ViewBag.PageTitle = "Liên hệ & Hỗ trợ — CinemaX";
        return View();
    }

    // POST /contact
    [HttpPost("")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit(string name, string email, string? phone, string? subject, string message)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(message))
        {
            TempData["Error"] = "Vui lòng điền đầy đủ thông tin.";
            return RedirectToAction(nameof(Index));
        }

        int contactId = 0;
        try
        {
            contactId = await db.QuerySingleAsync<int>(@"
                INSERT INTO contacts (name, email, phone, subject, message, status)
                VALUES (@name, @email, @phone, @subject, @message, 'pending');
                SELECT last_insert_rowid();",
                new { 
                    name = name.Trim(), 
                    email = email.Trim(), 
                    phone = phone?.Trim(), 
                    subject = subject?.Trim(), 
                    message = message.Trim() 
                });
            TempData["Success"] = "Gửi yêu cầu hỗ trợ thành công! Bạn có thể xem chi tiết bên dưới.";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi khi lưu thông tin: " + ex.Message;
            return RedirectToAction(nameof(Index));
        }

        return RedirectToAction(nameof(Details), new { id = contactId });
    }

    // GET /contact/details/{id}
    [HttpGet("details/{id}")]
    public async Task<IActionResult> Details(int id)
    {
        var contact = await db.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM contacts WHERE id = @Id", new { Id = id });
        if (contact == null)
        {
            return NotFound();
        }
        ViewBag.PageTitle = $"Chi tiết yêu cầu hỗ trợ #{id} — CinemaX";
        return View(contact);
    }
}
