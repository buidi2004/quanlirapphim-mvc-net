using CinemaXNet.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Runtime.ExceptionServices;
using System.Text.Json;
using CinemaXNet.Application.Responses;

namespace CinemaXNet.Infrastructure.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            // Giữ nguyên stack trace gốc thay vì "throw exception;"
            // để Developer Exception Page hiển thị đúng nơi lỗi thật sự phát sinh
            ExceptionDispatchInfo.Capture(exception).Throw();
        }

        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            NotFoundException => (int)HttpStatusCode.NotFound,
            BusinessException => (int)HttpStatusCode.BadRequest,
            ConcurrencyException => (int)HttpStatusCode.Conflict,
            SeatUnavailableException => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = statusCode;

        var response = ApiResponse<object>.Fail(exception.Message);
        var result = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return context.Response.WriteAsync(result);
    }
}