using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace SmartFeedbackAPI.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadImageAsync(IFormFile file);
    }
}
