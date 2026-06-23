using System.Data;
using CinemaXNet.Models.Domain;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/cinemas")]
public class AdminCinemasController(IDbConnection db) : Controller
{
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        var cinemas = await db.QueryAsync<Cinema>("SELECT * FROM cinemas ORDER BY id DESC");
        return View("~/Views/Admin/Cinemas/Index.cshtml", cinemas);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Store(string name, string address, string province, string? phone)
    {
        try
        {
            var sql = "INSERT INTO cinemas (name, address, province, phone) VALUES (@Name, @Address, @Province, @Phone)";
            await db.ExecuteAsync(sql, new { Name = name, Address = address, Province = province, Phone = phone });
            TempData["Success"] = "Thêm rạp thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int id, string name, string address, string province, string? phone)
    {
        try
        {
            var sql = "UPDATE cinemas SET name = @Name, address = @Address, province = @Province, phone = @Phone WHERE id = @Id";
            await db.ExecuteAsync(sql, new { Id = id, Name = name, Address = address, Province = province, Phone = phone });
            TempData["Success"] = "Cập nhật rạp thành công!";
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
            await db.ExecuteAsync("DELETE FROM cinemas WHERE id = @Id", new { Id = id });
            TempData["Success"] = "Xóa rạp thành công!";
        }
        catch (Exception ex)
        {
            TempData["Error"] = "Lỗi: " + ex.Message;
        }
        return RedirectToAction(nameof(Index));
    }
}
