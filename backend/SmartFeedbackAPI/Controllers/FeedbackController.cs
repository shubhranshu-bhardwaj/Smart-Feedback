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

        public FeedbackController(DataContext context)
        {
            _context = context;
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
                UserId = userId.Value
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
                    f.SubmittedAt
                })
                .ToListAsync();

            return Ok(feedbacks);
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
