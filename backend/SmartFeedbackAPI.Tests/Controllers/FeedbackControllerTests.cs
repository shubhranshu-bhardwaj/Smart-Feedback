using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Controllers;
using SmartFeedbackAPI.Data;
using SmartFeedbackAPI.DTOs;
using SmartFeedbackAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using SmartFeedbackAPI.Tests.Services;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Text;

namespace SmartFeedbackAPI.Tests.Controllers
{

    public class FeedbackControllerTests
    {

        private BlobStorageService GetRealBlobStorageService()
        {
            var settings = new Dictionary<string, string>
    {
        { "AzureBlobStorage:ConnectionString", "UseDevelopmentStorage=true" },
        { "AzureBlobStorage:ContainerName", "test-container" }
    };

            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();

            return new BlobStorageService(config);
        }
        private DataContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new DataContext(options);
        }

        private ClaimsPrincipal GetTestUser(int userId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new ClaimsIdentity(claims, "test");
            return new ClaimsPrincipal(identity);
        }

        [Fact]
        public async Task SubmitFeedback_InvalidModel_ReturnsBadRequest()
        {
            var context = GetInMemoryDbContext();
            var controller = new FeedbackController(context, GetRealBlobStorageService());
            controller.ModelState.AddModelError("Heading", "Required");

            var result = await controller.SubmitFeedback(new FeedbackDto());

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task SubmitFeedback_UnauthenticatedUser_ReturnsUnauthorized()
        {
            var context = GetInMemoryDbContext();
            var controller = new FeedbackController(context, GetRealBlobStorageService());
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext() // No user added
            };

            var result = await controller.SubmitFeedback(new FeedbackDto());

            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task GetMyFeedbacks_UnauthenticatedUser_ReturnsUnauthorized()
        {
            var context = GetInMemoryDbContext();
            var controller = new FeedbackController(context, GetRealBlobStorageService());
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext() // No user
            };

            var result = await controller.GetMyFeedbacks();

            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task UploadImage_NullFile_ReturnsBadRequest()
        {
            var context = GetInMemoryDbContext();
            var controller = new FeedbackController(context, GetRealBlobStorageService());

            var result = await controller.UploadImage(null!);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No image provided.", badRequest.Value);
        }

        [Fact]
        public async Task UploadImage_InvalidExtension_ReturnsBadRequest()
        {
            var formFile = new FormFile(
                baseStream: new MemoryStream(Encoding.UTF8.GetBytes("fake data")),
                baseStreamOffset: 0,
                length: 10,
                name: "file",
                fileName: "file.txt"
            );

            var controller = new FeedbackController(GetInMemoryDbContext(), GetRealBlobStorageService());

            var result = await controller.UploadImage(formFile);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Unsupported image format. Allowed formats: .jpg, .jpeg, .png, .gif", badRequest.Value);
        }


        [Fact]
        public async Task SubmitFeedback_ValidDto_ReturnsOk()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var blobService = GetRealBlobStorageService(); // using real blob service

            var controller = new FeedbackController(context, blobService);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = GetTestUser(1)
                }
            };

            var dto = new FeedbackDto
            {
                Heading = "Test Heading",
                Category = "Test Cat",
                Subcategory = "Test Subcat",
                Message = "Test Message",
                Image = "test.jpg" // image URL will be uploaded
            };

            // Act
            var result = await controller.SubmitFeedback(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }


        [Fact]
        public async Task GetMyFeedbacks_ReturnsFeedbacks()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            context.Feedbacks.Add(new Feedback
            {
                UserId = 1,
                Heading = "Head",
                Category = "Cat",
                Subcategory = "Sub",
                Message = "Msg",
                SubmittedAt = DateTime.UtcNow,
                Image = "img.png"
            });
            await context.SaveChangesAsync();

            var controller = new FeedbackController(context, null!);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = GetTestUser(1)
                }
            };

            // Act
            var result = await controller.GetMyFeedbacks();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.Single(list);
        }
    }
}
