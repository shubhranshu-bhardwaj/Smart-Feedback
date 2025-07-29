using Xunit;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text;
using System;
using SmartFeedbackAPI.Services;
using SmartFeedbackAPI.Tests.Services; // 👈 This is required

public class BlobStorageServiceTests
{
    private IConfiguration GetFakeConfiguration(Dictionary<string, string> overrides = null)
    {
        var settings = new Dictionary<string, string> {
            {"AzureBlobStorage:ConnectionString", "UseDevelopmentStorage=true"},
            {"AzureBlobStorage:ContainerName", "test-container"}
        };

        if (overrides != null)
        {
            foreach (var kvp in overrides)
            {
                settings[kvp.Key] = kvp.Value;
            }
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }

    private IFormFile GetTestFormFile(string fileName = "test.jpg", string content = "dummy")
    {
        var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
        return new FormFile(stream, 0, stream.Length, "file", fileName);
    }

    [Fact]
    public async Task UploadImageAsync_UploadsSuccessfully()
    {
        // Arrange
        var config = GetFakeConfiguration();
        var service = new FakeBlobStorageService();
        var file = GetTestFormFile();

        // Act
        var result = await service.UploadImageAsync(file);

        // Assert
        Assert.StartsWith("http", result); // URL-like return
        Assert.Contains("test-container", result); // Should contain container name
    }

    [Fact]
    public void Constructor_ThrowsException_WhenConnectionStringMissing()
    {
        // Arrange
        var config = GetFakeConfiguration(new Dictionary<string, string> {
            {"AzureBlobStorage:ConnectionString", ""}
        });

        // Act & Assert
        var ex = Assert.Throws<ArgumentNullException>(() => new BlobStorageService(config));
        Assert.Equal("connectionString", ex.ParamName);
    }

    [Fact]
    public void Constructor_ThrowsException_WhenContainerNameMissing()
    {
        // Arrange
        var config = GetFakeConfiguration(new Dictionary<string, string> {
            {"AzureBlobStorage:ContainerName", ""}
        });

        // Act & Assert
        var ex = Assert.Throws<ArgumentNullException>(() => new BlobStorageService(config));
        Assert.Equal("_containerName", ex.ParamName);
    }

    // [Fact]
    // public async Task UploadImageAsync_ThrowsException_WhenFileIsNull()
    // {
    //     var service = new FakeBlobStorageService();

    //     await Assert.ThrowsAsync<ArgumentNullException>(() => service.UploadImageAsync(null));
    // }





    [Fact]
    public async Task UploadImageAsync_ReturnsUrl_WhenFileIsEmpty()
    {
        var service = new FakeBlobStorageService();
        var file = new FormFile(new MemoryStream(), 0, 0, "file", "empty.jpg");

        var result = await service.UploadImageAsync(file);

        Assert.StartsWith("http", result);
    }

    [Fact]
    public async Task UploadImageAsync_Works_WhenFileHasNoExtension()
    {
        var service = new FakeBlobStorageService();
        var file = GetTestFormFile("testfile"); // no .jpg, .png etc

        var result = await service.UploadImageAsync(file);

        Assert.StartsWith("http", result);
    }

    [Fact]
    public async Task UploadImageAsync_ReturnsNull_WhenFileIsNull()
    {
        var service = new FakeBlobStorageService();

        var result = await service.UploadImageAsync(null);

        Assert.Null(result);
    }





}
