using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using SmartFeedbackAPI.Controllers;
using SmartFeedbackAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Azure.AI.TextAnalytics;
using Azure;
using System;
using SmartFeedbackAPI.Models;

public class AdminControllerTests
{
    private readonly AdminController _controller;
    private readonly DataContext _context;

    public AdminControllerTests()
    {
        // Setup InMemory DbContext
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new DataContext(options);

        var user = new User { Id = 1, FullName = "Test User", Email = "test@example.com" };
        _context.Users.Add(user);

        _context.Feedbacks.Add(new Feedback
        {
            Id = 1,
            Heading = "Test",
            Category = "Cat",
            Subcategory = "Sub",
            Message = "Test Message",
            SubmittedAt = DateTime.UtcNow,
            UserId = 1,
            User = user
        });

        _context.SaveChanges();

        // Mock IConfiguration
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(x => x["AzureCognitiveServices:Endpoint"]).Returns("https://dummy.cognitiveservices.azure.com/");
        configMock.Setup(x => x["AzureCognitiveServices:Key"]).Returns("dummy-key");

        // Override TextAnalyticsClient with a stub
        _controller = new AdminController(_context, configMock.Object)
        {
            // If needed, you can override private method via reflection or use test hooks.
        };
    }

    [Fact]
    public async Task GetAllFeedbacks_ReturnsOk()
    {
        var result = await _controller.GetAllFeedbacks();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
        Assert.NotEmpty(data);
    }

    [Fact]
    public async Task DeleteFeedback_RemovesFeedback()
    {
        // Arrange
        int feedbackId = 1;

        // Act
        var result = await _controller.DeleteFeedback(feedbackId);

        // Assert
        var objectResult = Assert.IsType<OkObjectResult>(result);

        // Convert the anonymous object to JSON and parse it
        var json = System.Text.Json.JsonSerializer.Serialize(objectResult.Value);
        using var doc = System.Text.Json.JsonDocument.Parse(json);
        string message = doc.RootElement.GetProperty("message").GetString();

        Assert.Equal("Feedback deleted successfully", message);
    }

    [Fact]
    public async Task GetAllFeedbacks_ReturnsUnknown_WhenSentimentFails()
    {
        var mockClient = new Mock<TextAnalyticsClient>();
        mockClient.Setup(x => x.AnalyzeSentimentAsync(It.IsAny<string>(), null, default))
                  .ThrowsAsync(new RequestFailedException("Failed"));

        var configMock = new Mock<IConfiguration>();
        configMock.Setup(x => x["AzureCognitiveServices:Endpoint"]).Returns("https://dummy.cognitiveservices.azure.com/");
        configMock.Setup(x => x["AzureCognitiveServices:Key"]).Returns("dummy-key");

        var controller = new AdminController(_context, configMock.Object);

        var result = await controller.GetAllFeedbacks();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = okResult.Value as IEnumerable<dynamic>;

        Assert.All(data, f => Assert.Equal("Unknown", f.GetType().GetProperty("Sentiment")?.GetValue(f)));
    }

    [Fact]
    public async Task DeleteFeedback_ReturnsNotFound_IfFeedbackDoesNotExist()
    {
        var result = await _controller.DeleteFeedback(999); // invalid id

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Feedback not found", notFoundResult.Value);
    }

    [Fact]
    public async Task GetUsersWithFeedbacks_ReturnsUsersWithFeedbacks()
    {
        var result = await _controller.GetUsersWithFeedbacks();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);

        Assert.NotEmpty(users);
    }



}
