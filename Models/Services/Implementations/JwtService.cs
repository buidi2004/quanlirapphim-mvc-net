using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CinemaXNet.Models.Domain;
using CinemaXNet.Models.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CinemaXNet.Models.Services.Implementations;

public class JwtService(IConfiguration configuration) : IJwtService
{
    public string GenerateToken(User user)
    {
        var secretKey = configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Secret Key is not configured.");
        var issuer = configuration["Jwt:Issuer"] ?? "CinemaX";
        var audience = configuration["Jwt:Audience"] ?? "CinemaXUsers";
        var expireDays = double.TryParse(configuration["Jwt:ExpireDays"], out var days) ? days : 7;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(expireDays),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
