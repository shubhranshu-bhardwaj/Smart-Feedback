using SmartFeedbackAPI.Models;
using Xunit;

namespace SmartFeedbackAPI.Tests.Models
{
    public class UserModelTests
    {
        [Fact]
        public void UserModel_PropertySettersAndGetters_WorkCorrectly()
        {
            // Arrange
            var user = new User();

            // Act
            user.Id = 1;
            user.FullName = "John Doe";
            user.Email = "john@example.com";
            user.PasswordHash = "hashedpassword";
            user.Gender = "Male";
            user.Img = "profile.jpg";
            user.IsAdmin = true;

            // Assert
            Assert.Equal(1, user.Id);
            Assert.Equal("John Doe", user.FullName);
            Assert.Equal("john@example.com", user.Email);
            Assert.Equal("hashedpassword", user.PasswordHash);
            Assert.Equal("Male", user.Gender);
            Assert.Equal("profile.jpg", user.Img);
            Assert.True(user.IsAdmin);
        }
    }
}
