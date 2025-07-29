// File: SmartFeedbackAPI.Tests/Services/FakeBlobStorageService.cs

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using SmartFeedbackAPI.Services;

namespace SmartFeedbackAPI.Tests.Services
{
    public class FakeBlobStorageService : BlobStorageService
    {
        public FakeBlobStorageService() : base(
            new ConfigurationBuilder().AddInMemoryCollection(
                new Dictionary<string, string>
                {
                    { "AzureBlobStorage:ConnectionString", "UseDevelopmentStorage=true" },
                    { "AzureBlobStorage:ContainerName", "test-container" }
                }).Build())
        {
        }

        public async Task<string?> UploadImageAsync(IFormFile? file)
        {
            if (file == null)
                return null;

            await Task.Delay(10); // Simulated async

            return $"https://fake.blob.core.windows.net/test-container/{Guid.NewGuid()}.jpg";
        }

    }
}
