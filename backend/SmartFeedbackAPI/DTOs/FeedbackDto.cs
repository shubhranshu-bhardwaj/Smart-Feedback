using System.ComponentModel.DataAnnotations;

namespace SmartFeedbackAPI.DTOs
{
    public class FeedbackDto
    {
        [Required]
        public string Heading { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Subcategory { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;
    }
}
