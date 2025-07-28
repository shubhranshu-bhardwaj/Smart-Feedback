using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Controllers;
using SmartFeedbackAPI.Data;
using SmartFeedbackAPI.DTOs;
using SmartFeedbackAPI.Models;
using SmartFeedbackAPI.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;


public class AuthControllerTests
{
    private readonly AuthController _controller;
    private readonly DataContext _context;
    private readonly Mock<TokenService> _tokenServiceMock;

    public AuthControllerTests()
    {
        // In-memory DB
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb")
            .Options;
        _context = new DataContext(options);

        // Clear DB before each test
        _context.Database.EnsureDeleted();
        _context.Database.EnsureCreated();

        // Mock TokenService
        _tokenServiceMock = new Mock<TokenService>(null); // Pass null if TokenService doesn't depend on anything or mock dependencies

        _controller = new AuthController(_context, _tokenServiceMock.Object);
    }

    [Fact]
    public async Task Register_NewUser_ReturnsOk()
    {
        // Arrange
        var user = new User
        {
            FullName = "Test User",
            Email = "test@example.com",
            PasswordHash = "plainpassword", // Will be hashed internally
            IsAdmin = false
        };

        // Act
        var result = await _controller.Register(user);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("User registered", okResult.Value);
    }

    [Fact]
    public async Task Register_ExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var existingUser = new User
        {
            FullName = "Existing",
            Email = "duplicate@example.com",
            PasswordHash = "existing",
            IsAdmin = false
        };
        await _context.Users.AddAsync(existingUser);
        await _context.SaveChangesAsync();

        var newUser = new User
        {
            FullName = "New",
            Email = "duplicate@example.com",
            PasswordHash = "newpassword"
        };

        // Act
        var result = await _controller.Register(newUser);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Email already exists", badRequest.Value);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new DataContext(options);
        var hashedPassword = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes("password123")));

        var testUser = new User
        {
            FullName = "Test User",
            Email = "test@example.com",
            PasswordHash = hashedPassword,
            IsAdmin = true
        };

        context.Users.Add(testUser);
        context.SaveChanges();

        // Setup minimal config for token service
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string>
    {
        { "Jwt:Key", "supersecurekeyvalueofatleast32chars" }, // Key must be at least 256 bits (32 bytes)
        { "Jwt:Issuer", "testIssuer" },
        { "Jwt:Audience", "testAudience" }
    }).Build();

        var tokenService = new TokenService(config);
        var controller = new AuthController(context, tokenService);

        var loginDto = new LoginDto
        {
            Email = "test@example.com",
            Password = "password123"
        };

        // Act
        var result = await controller.Login(loginDto) as OkObjectResult;

        // ✅ Deserialize and assert
        var json = JsonSerializer.Serialize(result.Value);
        var obj = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

        Assert.NotNull(result);
        Assert.True(obj.ContainsKey("token"));
        Assert.True(obj.ContainsKey("isAdmin"));
        Assert.True(obj.ContainsKey("fullName"));
    }



    // Include this helper method inside your test class
    private string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }


    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var password = "correct";
        var hashed = Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(password)));

        var user = new User
        {
            FullName = "Wrong Password",
            Email = "wrongpass@example.com",
            PasswordHash = hashed
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var dto = new LoginDto
        {
            Email = "wrongpass@example.com",
            Password = "wrong"
        };

        // Act
        var result = await _controller.Login(dto);

        // Assert
        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("Invalid credentials", unauthorized.Value);
    }

    [Fact]
    public async Task Login_EmailNotFound_ReturnsUnauthorized()
    {
        // Act
        var result = await _controller.Login(new LoginDto
        {
            Email = "nonexistent@example.com",
            Password = "any"
        });

        // Assert
        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("Invalid credentials", unauthorized.Value);
    }
}
