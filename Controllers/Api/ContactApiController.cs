using CinemaXNet.Application.Interfaces;
using CinemaXNet.Application.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemaXNet.Controllers.Api;

[ApiController]
[Route("api/contacts")]
[AllowAnonymous]
public class ContactApiController(IContactService contactService) : ControllerBase
{
    [HttpPost("")]
    public async Task<IActionResult> SubmitContact([FromBody] SubmitContactRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Message))
        {
            return BadRequest(ApiResponse<object>.Fail("Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Email, Nội dung)."));
        }

        try
        {
            await contactService.CreateContactAsync(new { 
                name = req.Name.Trim(), 
                email = req.Email.Trim(), 
                phone = req.Phone?.Trim(), 
                subject = req.Subject?.Trim(), 
                message = req.Message.Trim() 
            });
            return Ok(ApiResponse<object>.Ok(new { }, "Yêu cầu hỗ trợ của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất có thể."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail("Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau."));
        }
    }
}

public class SubmitContactRequest 
{ 
    public string Name { get; set; } = string.Empty; 
    public string Email { get; set; } = string.Empty; 
    public string? Phone { get; set; } 
    public string? Subject { get; set; } 
    public string Message { get; set; } = string.Empty; 
}
