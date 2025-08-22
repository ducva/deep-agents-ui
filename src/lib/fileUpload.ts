import { getDeployment } from "./environment/deployments";

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
 * Get a presigned URL and fileId for file upload
 */
export async function getPresignedUrl(
  accessToken: string,
  fileInfo: FileUploadRequest
): Promise<FileUploadResponse> {
  const deployment = getDeployment();
  
  if (!deployment.deploymentUrl || !deployment.workspaceId) {
    throw new Error("Missing deployment configuration for file upload");
  }

  const apiUrl = `${deployment.deploymentUrl}/v20250505/${deployment.workspaceId}/files/upload`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-auth-scheme': 'langsmith',
    },
    body: JSON.stringify({
      fileName: fileInfo.fileName,
      mimeType: fileInfo.mimeType,
      fileSize: fileInfo.fileSize,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get presigned URL: ${response.status}`);
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
 * Complete file upload process: get presigned URL and upload file
 */
export async function uploadFile(
  accessToken: string,
  file: File,
  mimeType?: string
): Promise<string> {
  // Step 1: Get presigned URL and fileId
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