using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;

public class BlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("AzureBlobStorage:ConnectionString").Value;
        _containerName = configuration.GetSection("AzureBlobStorage:ContainerName").Value;

        if (string.IsNullOrEmpty(connectionString))
            throw new ArgumentNullException(nameof(connectionString), "Azure Blob connection string is missing.");

        if (string.IsNullOrEmpty(_containerName))
            throw new ArgumentNullException(nameof(_containerName), "Azure Blob container name is missing.");

        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync();
        var blobClient = containerClient.GetBlobClient(Guid.NewGuid() + Path.GetExtension(file.FileName));
        using (var stream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(stream, true);
        }

        return blobClient.Uri.ToString();
    }
}