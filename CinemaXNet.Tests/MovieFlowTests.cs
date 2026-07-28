using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using Xunit;
using CinemaXNet.Application.Interfaces;
using CinemaXNet.Domain.Entities;

namespace CinemaXNet.Tests.IntegrationTests;

public class MovieFlowTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public MovieFlowTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Admin_CreatesMovie_ShouldAppearOnFrontend()
    {
        // Arrange
        var client = _factory.CreateClient();
        
        using var scope = _factory.Services.CreateScope();
        var movieService = scope.ServiceProvider.GetRequiredService<IMovieService>();
        
        // Tạo một bộ phim giả lập ở database
        var movie = new Movie 
        { 
            Title = "Test End2End Movie", 
            Status = "now_showing", 
            DurationMinutes = 120, 
            AgeRating = "P" 
        };
        await movieService.CreateMovieAsync(movie);

        // Act - Truy cập trang chủ (luồng FE)
        var response = await client.GetAsync("/");
        response.EnsureSuccessStatusCode(); // Kiểm tra không bị lỗi (200-299)
        var htmlContent = await response.Content.ReadAsStringAsync();

        // Assert - Phim phải xuất hiện trên Frontend
        Assert.Contains("Test End2End Movie", htmlContent);
        
        // Act - Truy cập chi tiết phim
        var detailResponse = await client.GetAsync($"/movies/{movie.Id}");
        detailResponse.EnsureSuccessStatusCode();
        var detailHtml = await detailResponse.Content.ReadAsStringAsync();
        
        // Assert - Tiêu đề phim phải xuất hiện ở trang Detail
        Assert.Contains("Test End2End Movie", detailHtml);
    }
}
