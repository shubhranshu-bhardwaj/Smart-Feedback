using SmartFeedbackAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace SmartFeedbackAPI.Data;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {

    }

    public DbSet<User> Users { get; set; }
     public DbSet<Feedback> Feedbacks { get; set; }
}