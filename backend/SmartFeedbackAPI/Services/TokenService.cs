// using System.IdentityModel.Tokens.Jwt;
// using System.Security.Claims;
// using System.Text;
// using Microsoft.IdentityModel.Tokens;
// using SmartFeedbackAPI.Models;

// namespace SmartFeedbackAPI.Services;

// public class TokenService
// {
//     private readonly IConfiguration _config;

//     public TokenService(IConfiguration config)
//     {
//         _config = config;
//     }

//     public string CreateToken(User user)
//     {
//         var claims = new[]
//         {
//             new Claim(ClaimTypes.Name, user.Email),
//             new Claim("UserId", user.Id.ToString()),
//             new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
//         };

//         var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
//         var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

//         var token = new JwtSecurityToken(
//             claims: claims,
//             expires: DateTime.Now.AddDays(1),
//             signingCredentials: creds
//         );

//         return new JwtSecurityTokenHandler().WriteToken(token);
//     }
// }

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SmartFeedbackAPI.Models;

namespace SmartFeedbackAPI.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // REQUIRED for [Authorize]
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
