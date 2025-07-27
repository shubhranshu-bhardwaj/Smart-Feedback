using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Data;
using Azure;
using Azure.AI.TextAnalytics;
using SmartFeedbackAPI.DTOs;
using SmartFeedbackAPI.Models;
using System.Security.Claims;

namespace SmartFeedbackAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")] // Only admin can access
public class AdminController : ControllerBase
{
    private readonly DataContext _context;
    private readonly TextAnalyticsClient _textClient;

    public AdminController(DataContext context, IConfiguration config)
    {
        _context = context;
        var endpoint = new Uri(config["AzureCognitiveServices:Endpoint"]);
        var key = new AzureKeyCredential(config["AzureCognitiveServices:Key"]);
        _textClient = new TextAnalyticsClient(endpoint, key);
    }

    // GET: api/admin/all-feedbacks
    [HttpGet("all-feedbacks")]
    // public async Task<IActionResult> GetAllFeedbacks()
    // {
    //     var feedbacks = await _context.Feedbacks
    //         .Include(f => f.User) // this works only if Feedback.User exists
    //         .Select(f => new
    //         {
    //             f.Id,
    //             f.Heading,
    //             f.Category,
    //             f.Subcategory,
    //             f.Message,
    //             f.SubmittedAt,
    //             ImageUrl = f.Image,
    //             FullName = f.User.FullName,
    //             Email = f.User.Email
    //         })
    //         .OrderByDescending(f => f.SubmittedAt)
    //         .ToListAsync();

    //     return Ok(feedbacks);
    // }
    public async Task<IActionResult> GetAllFeedbacks()
    {
        var feedbacks = await _context.Feedbacks
            .Include(f => f.User)
            .OrderByDescending(f => f.SubmittedAt)
            .ToListAsync();

        var resultList = new List<object>();

        foreach (var f in feedbacks)
        {
            var sentiment = await AnalyzeSentimentAsync(f.Message);

            resultList.Add(new
            {
                f.Id,
                f.Heading,
                f.Category,
                f.Subcategory,
                f.Message,
                f.SubmittedAt,
                ImageUrl = f.Image,
                FullName = f.User.FullName,
                Email = f.User.Email,
                Sentiment = sentiment
            });
        }

        return Ok(resultList);
    }
    private async Task<string> AnalyzeSentimentAsync(string text)
    {
        try
        {
            var response = await _textClient.AnalyzeSentimentAsync(text);
            return response.Value.Sentiment.ToString(); // "Positive", "Neutral", "Negative"
        }
        catch
        {
            return "Unknown";
        }
    }



    // DELETE: api/admin/delete-feedback/{feedbackId}
    [HttpDelete("delete-feedback/{feedbackId}")]
    public async Task<IActionResult> DeleteFeedback(int feedbackId)
    {
        var feedback = await _context.Feedbacks.FindAsync(feedbackId);
        if (feedback == null)
            return NotFound("Feedback not found");

        _context.Feedbacks.Remove(feedback);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Feedback deleted successfully" });
    }

    [HttpGet("users-with-feedbacks")]
    public async Task<IActionResult> GetUsersWithFeedbacks()
    {
        var usersWithFeedbacks = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                Feedbacks = _context.Feedbacks
                    .Where(f => f.UserId == u.Id)
                    .OrderByDescending(f => f.SubmittedAt)
                    .Select(f => new
                    {
                        f.Id,
                        f.Heading,
                        f.Category,
                        f.Subcategory,
                        f.Message,
                        f.SubmittedAt
                    }).ToList()
            })
            .ToListAsync();

        return Ok(usersWithFeedbacks);
    }


    // [Authorize(Roles = "Admin")]
    // [HttpGet("audit-logs")]
    // public async Task<IActionResult> GetAuditLogs()
    // {
    //     var logs = await _context.AuditLogs
    //         .OrderByDescending(log => log.Timestamp)
    //         .Select(log => new
    //         {
    //             log.Id,
    //             AdminId = log.PerformedByUserId,
    //             AdminName = _context.Users
    //                 .Where(u => u.Id == log.PerformedByUserId)
    //                 .Select(u => u.FullName)
    //                 .FirstOrDefault(),
    //             log.ActionType,
    //             log.Description,
    //             log.Timestamp
    //         })
    //         .ToListAsync();

    //     return Ok(logs);
    // }

}