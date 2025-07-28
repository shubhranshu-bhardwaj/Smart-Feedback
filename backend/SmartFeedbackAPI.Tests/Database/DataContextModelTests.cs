using System;
using System.Data.Common;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SmartFeedbackAPI.Data;
using Xunit;

namespace SmartFeedbackAPI.Tests.Database
{
    public class DataContextModelTests : IDisposable
    {
        private readonly DbConnection _connection;
        private readonly DbContextOptions<DataContext> _options;

        public DataContextModelTests()
        {
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            _options = new DbContextOptionsBuilder<DataContext>()
                .UseSqlite(_connection)
                .Options;

            using var context = new DataContext(_options);
            context.Database.EnsureCreated(); // Or use context.Database.Migrate() if using real migrations
        }

        [Fact]
        public void CanConnectToDatabase()
        {
            using var context = new DataContext(_options);
            Assert.True(context.Database.CanConnect());
        }

        [Fact]
        public void Tables_AreCreated_Correctly()
        {
            using var context = new DataContext(_options);

            var command = _connection.CreateCommand();
            command.CommandText = "SELECT name FROM sqlite_master WHERE type='table'";

            using var reader = command.ExecuteReader();

            var tables = new List<string>();
            while (reader.Read())
            {
                tables.Add(reader.GetString(0));
            }

            Assert.Contains("Users", tables);
            Assert.Contains("Feedbacks", tables);
        }


        [Fact]
        public void FeedbacksTable_HasForeignKeyTo_Users()
        {
            using var context = new DataContext(_options);

            var command = _connection.CreateCommand();
            command.CommandText = "PRAGMA foreign_key_list('Feedbacks');";

            using var reader = command.ExecuteReader();
            bool hasUserFK = false;

            while (reader.Read())
            {
                var table = reader["table"].ToString();
                var from = reader["from"].ToString();
                var to = reader["to"].ToString();

                if (table == "Users" && from == "UserId" && to == "Id")
                {
                    hasUserFK = true;
                    break;
                }
            }

            Assert.True(hasUserFK, "Feedbacks.UserId foreign key to Users.Id was not found.");
        }

        public void Dispose()
        {
            _connection?.Dispose();
        }
    }
}
