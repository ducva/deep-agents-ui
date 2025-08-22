interface FileUploadRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

interface FileUploadResponse {
  fileId: string;
  presignedUrl: string;
  uploadUrl?: string;
}

/**
 * Get a presigned URL and fileId for file upload using Studio API
 */
export async function getPresignedUrl(
  accessToken: string,
  fileInfo: FileUploadRequest
): Promise<FileUploadResponse> {
  // Use the new Studio API endpoint for creating file assets
  // Allow configuration through environment variable for flexibility
  const studioApiUrl = import.meta.env.VITE_STUDIO_API_URL || "https://api.studio.deca-dev.com";
  const apiUrl = `${studioApiUrl}/files`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: fileInfo.fileName,
      mimeType: fileInfo.mimeType,
      fileSize: fileInfo.fileSize,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create file asset: ${response.status}`);
  }

  return response.json();
}

/**
 * Upload file content to the presigned URL
 */
export async function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: File,
  mimeType?: string
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType || file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.status}`);
  }
}

/**
 * Complete file upload process: create file asset, get presigned URL and upload file
 */
export async function uploadFile(
  accessToken: string,
  file: File,
  mimeType?: string
): Promise<string> {
  // Step 1: Create file asset and get presigned URL with fileId from Studio API
  const uploadResponse = await getPresignedUrl(accessToken, {
    fileName: file.name,
    mimeType: mimeType || file.type,
    fileSize: file.size,
  });

  // Step 2: Upload file content to presigned URL
  await uploadFileToPresignedUrl(
    uploadResponse.presignedUrl,
    file,
    mimeType
  );

  // Step 3: Return fileId for storage
  return uploadResponse.fileId;
}