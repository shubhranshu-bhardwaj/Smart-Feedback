using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Data;
using SmartFeedbackAPI.DTOs;
using SmartFeedbackAPI.Models;
using System.Security.Claims;

namespace SmartFeedbackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly BlobStorageService _blobService;

        public FeedbackController(DataContext context, BlobStorageService blobService)
        {
            _context = context;
            _blobService = blobService;
        }

        // POST: api/feedback/submit
        [Authorize]
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var feedback = new Feedback
            {
                Heading = dto.Heading,
                Category = dto.Category,
                Subcategory = dto.Subcategory,
                Message = dto.Message,
                SubmittedAt = DateTime.UtcNow,
                UserId = userId.Value,
                Image = dto.Image // Assuming ImageUrl is part of FeedbackDto
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully." });
        }

        // GET: api/feedback/my-feedbacks
        [Authorize]
        [HttpGet("my-feedbacks")]
        public async Task<IActionResult> GetMyFeedbacks()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var feedbacks = await _context.Feedbacks
                .Where(f => f.UserId == userId.Value)
                .OrderByDescending(f => f.SubmittedAt)
                .Select(f => new
                {
                    f.Heading,
                    f.Category,
                    f.Subcategory,
                    f.Message,
                    f.SubmittedAt,
                    imageUrl = f.Image
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image provided.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var ext = Path.GetExtension(image.FileName).ToLower();

            if (!allowedExtensions.Contains(ext))
                return BadRequest("Unsupported image format. Allowed formats: .jpg, .jpeg, .png, .gif");

            var imageUrl = await _blobService.UploadImageAsync(image);
            return Ok(new { imageUrl });
        }
        // Utility method to extract User ID from JWT
        private int? GetUserId()
        {
            if (User.Identity is ClaimsIdentity identity)
            {
                var userIdClaim = identity.FindFirst(ClaimTypes.NameIdentifier);
                if (int.TryParse(userIdClaim?.Value, out int userId))
                {
                    return userId;
                }
            }

            return null;
        }
    }
}
