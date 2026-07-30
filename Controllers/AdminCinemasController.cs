// AdminCinemasController: Controller xu ly cac yeu cau HTTP va dieu huong cho AdminCinemas
﻿using System.Data;
using CinemaXNet.Domain.Entities;
using CinemaXNet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers;

[Authorize(Roles = "admin,cinema_manager")]
[Route("admin/cinemas")]
public class AdminCinemasController(ICinemaService cinemaService, IRoomService roomService) : Controller
{
    [HttpGet]
    // Xử lý logic và luồng thực thi cho phương thức Index
    public async Task<IActionResult> Index(int page = 1)
    {
        var cinemas = await cinemaService.GetAllAsync();
        // Todo: Add true pagination logic
        return View("~/Views/Admin/Cinemas/Index.cshtml", cinemas);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Store
    public async Task<IActionResult> Store(string name, string slug, string province, string district, string address, int numberOfRooms, string? phone, string? email, double? latitude, double? longitude, string? imageUrl, string? openingHours, string? description, string? facilities)
    {
        try
        {
            var cinema = new Cinema 
            { 
                Name = name, 
                Slug = string.IsNullOrWhiteSpace(slug) ? "" : slug,
                Province = province, 
                District = string.IsNullOrWhiteSpace(district) ? "" : district,
                Address = address, 
                Phone = phone,
                Email = email,
                Latitude = latitude,
                Longitude = longitude,
                ImageUrl = imageUrl,
                OpeningHours = string.IsNullOrWhiteSpace(openingHours) ? "08:00 - 23:30" : openingHours,
                Description = description,
                Facilities = facilities
            };
            var cinemaId = await cinemaService.CreateAsync(cinema);
            
            // Auto generate rooms if requested
            if (cinemaId > 0 && numberOfRooms > 0)
            {
                for (int i = 1; i <= numberOfRooms; i++)
                {
                    var room = new Room
                    {
                        CinemaId = cinemaId,
                        Name = $"Phòng {i} - Standard",
                        TotalRows = 6,
                        SeatsPerRow = 8
                    };
                    await roomService.AddAsync(room);
                }
            }
            
            TempData["Success"] = "Thêm rạp thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Update
    public async Task<IActionResult> Update(int id, string name, string slug, string province, string district, string address, string? phone, string? email, double? latitude, double? longitude, string? imageUrl, string? openingHours, string? description, string? facilities)
    {
        try
        {
            var cinema = new Cinema 
            { 
                Name = name, 
                Slug = string.IsNullOrWhiteSpace(slug) ? "" : slug,
                Province = province, 
                District = string.IsNullOrWhiteSpace(district) ? "" : district,
                Address = address, 
                Phone = phone,
                Email = email,
                Latitude = latitude,
                Longitude = longitude,
                ImageUrl = imageUrl,
                OpeningHours = string.IsNullOrWhiteSpace(openingHours) ? "08:00 - 23:30" : openingHours,
                Description = description,
                Facilities = facilities
            };
            await cinemaService.UpdateAsync(id, cinema);
            TempData["Success"] = "Cập nhật rạp thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    // Xử lý logic và luồng thực thi cho phương thức Delete
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await cinemaService.DeleteAsync(id);
            TempData["Success"] = "Xóa rạp thành công!";
        }
        catch (Exception)
        {
            TempData["Error"] = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
        }
        return RedirectToAction(nameof(Index));
    }
}
