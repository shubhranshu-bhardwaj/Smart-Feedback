using System.ComponentModel.DataAnnotations;

namespace SmartFeedbackAPI.Models;

public class User
{
     public int Id { get; set; }

    [Required]
    public string FullName { get; set; } = "";

    [Required]
    public string Email { get; set; } = "";

    [Required]
    public string PasswordHash { get; set; } = "";

    public string Gender { get; set; } = "";

    public bool IsAdmin { get; set; } = false;
}
