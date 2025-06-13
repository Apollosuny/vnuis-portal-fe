import { nexusAxios } from '@/configs/axios.config';
import { FileType } from '@/types/file.types';

/**
 * Generates a presigned URL for direct upload to S3
 * @param fileName The name of the file to upload
 * @param contentType The MIME type of the file
 * @param fileType The type of file (from FileType enum)
 * @param metadata Additional metadata (like formId for admin forms)
 * @returns Object containing presigned URL and fields for S3 upload
 */
export const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string,
  fileType: FileType,
  metadata?: Record<string, any>
) => {
  const response = await nexusAxios.post('/storage/genS3Upload', {
    fileName,
    contentType,
    fileType,
    metadata,
  });
  return response.data;
};

/**
 * Uploads a file directly to S3 using the presigned URL
 * @param file The file to upload
 * @param presignedUrl The presigned URL from S3
 * @param fields The fields to include with the upload
 * @param onProgress Optional progress callback
 * @returns Response from S3
 */
export const uploadToS3 = async (
  file: File,
  presignedUrl: string,
  fields: Record<string, string>,
  onProgress?: (percentage: number) => void
) => {
  const formData = new FormData();

  // Add the fields to the form data
  Object.keys(fields).forEach((key) => {
    if (fields[key] !== undefined) {
      formData.append(key, fields[key]);
    }
  });

  // Add the file as the last field
  formData.append('file', file);

  // Create a new XMLHttpRequest to handle upload with progress
  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Set up progress handling
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          onProgress(percentage);
        }
      });
    }

    // Handle successful completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          status: xhr.status,
          response: xhr.response,
        });
      } else {
        reject({
          status: xhr.status,
          response: xhr.response,
        });
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject({
        status: xhr.status,
        response: xhr.response,
      });
    });

    // Open and send the request
    xhr.open('POST', presignedUrl, true);
    xhr.send(formData);
  });
};

/**
 * Combined function to get presigned URL and upload a file to S3
 * @param file The file to upload
 * @param fileType The type of file (from FileType enum)
 * @param metadata Additional metadata (like formId for admin forms)
 * @param onProgress Optional progress callback
 * @returns The response data with upload information
 */
export const uploadFile = async (
  file: File,
  fileType: FileType,
  metadata?: Record<string, any>,
  onProgress?: (percentage: number) => void
) => {
  try {
    // Step 1: Get the presigned URL
    const presignedData = await getPresignedUploadUrl(
      file.name,
      file.type,
      fileType,
      metadata
    );

    // Step 2: Upload the file to S3
    await uploadToS3(file, presignedData.url, presignedData.fields, onProgress);

    // Return the presigned data which includes file info
    return presignedData;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
