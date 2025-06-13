/**
 * Enum representing different file upload types
 * Each type corresponds to different storage paths and permissions in S3
 */
export enum FileType {
  public = 'public',
  private = 'private',
  avatar = 'avatar',
  document = 'document',
  form = 'form',
  event = 'event',
  formPdf = 'formPdf',
  adminForm = 'adminForm',
}

/**
 * Response from the file upload
 */
export interface FileUploadResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
  expectedUrl?: string;
  fileName?: string;
  filePath?: string;
  formId?: string;
  uploadedBy?: string;
}
