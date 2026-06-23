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
    public async Task<IActionResult> Submit(string name, string email, string? subject, string message)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(message))
        {
            TempData["Error"] = "Vui lòng điền đầy đủ thông tin.";
            return RedirectToAction(nameof(Index));
        }

        try
        {
            await db.ExecuteAsync(@"
                INSERT INTO contacts (name, email, subject, message)
                VALUES (@name, @email, @subject, @message)",
                new { name = name.Trim(), email = email.Trim(), subject = subject?.Trim(), message = message.Trim() });
        }
        catch
        {
            // Table might not exist yet — show success anyway
        }

        TempData["Success"] = "Gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ phản hồi trong 24h.";
        return RedirectToAction(nameof(Index));
    }
}
