// GlobalExceptionMiddleware: Thanh phan ma nguon xu ly logic trong he thong CinemaX
using CinemaXNet.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Runtime.ExceptionServices;
using System.Text.Json;
using CinemaXNet.Application.Responses;

namespace CinemaXNet.Infrastructure.Middleware;

// GlobalExceptionMiddleware: Middleware bắt và xử lý toàn bộ Ngoại lệ (Exception) chưa được bắt trong ứng dụng
// Mục đích: Chống crash ứng dụng, tự động chuyển đổi Domain Exception thành mã HTTP Status Code phù hợp (404, 400, 409, 500)
public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context); // Chuyển Request sang Middleware tiếp theo trong đường ống
        }
        catch (Exception ex)
        {
            // Bắt được lỗi chưa xử lý -> Ghi log vết lỗi (Stack Trace)
            logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // 1. Nếu không phải yêu cầu API (Ví dụ: Yêu cầu Web MVC thông thường)
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            // Giữ nguyên stack trace gốc bằng ExceptionDispatchInfo thay vì "throw exception;"
            // Giúp Developer Exception Page của .NET hiển thị chính xác dòng code bị lỗi thật sự
            ExceptionDispatchInfo.Capture(exception).Throw();
        }

        // 2. Nếu là Yêu cầu API (bắt đầu bằng /api) -> Trả về định dạng chuẩn JSON ApiResponse
        context.Response.ContentType = "application/json";

        // Ánh xạ (Map) từ kiểu Domain Exception sang mã HTTP Status Code tương ứng
        var statusCode = exception switch
        {
            NotFoundException => (int)HttpStatusCode.NotFound,               // 404 Not Found
            BusinessException => (int)HttpStatusCode.BadRequest,             // 400 Bad Request
            ConcurrencyException => (int)HttpStatusCode.Conflict,           // 409 Conflict (Tranh chấp ghế)
            SeatUnavailableException => (int)HttpStatusCode.Conflict,       // 409 Conflict (Ghế đã bị đặt)
            _ => (int)HttpStatusCode.InternalServerError                   // 500 Internal Server Error (Lỗi hệ thống)
        };

        context.Response.StatusCode = statusCode;

        // Trả về JSON ApiResponse<object>.Fail(message)
        var response = ApiResponse<object>.Fail(exception.Message);
        var result = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return context.Response.WriteAsync(result);
    }
}