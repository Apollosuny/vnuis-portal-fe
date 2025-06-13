'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '@/api/file.api';
import { FileType } from '@/types/file.types';
import { getAPIErrorMessage } from '@/utils/error';
import { getFormById } from '@/api/form.api';

/**
 * Hook for handling admin form PDF uploads
 * @param formId - Optional ID of the form to associate with the PDF
 * @returns Object containing upload functions and state
 */
export const useFormPdfUpload = (formId?: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  /**
   * Upload a PDF file for an admin form
   * @param file The PDF file to upload
   * @returns The upload result with file details
   */
  const uploadPdf = async (file: File, currentFormId?: string) => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return null;
    }

    const targetFormId = currentFormId || formId;
    if (!targetFormId) {
      toast.error('Form ID is required for PDF upload');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const result = await uploadFile(
        file,
        FileType.adminForm,
        { formId: targetFormId },
        (progress) => setUploadProgress(progress)
      );

      setPdfUrl(result.expectedUrl || null);
      setPdfPath(result.filePath || null);
      setPdfFileName(file.name);
      setPdfFile(file);

      toast.success('PDF uploaded successfully');
      return result;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(`Upload failed: ${getAPIErrorMessage(error)}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Reset the PDF upload state
   */
  const resetPdfUpload = () => {
    setPdfUrl(null);
    setPdfFile(null);
    setPdfPath(null);
    setPdfFileName(null);
    setUploadProgress(0);
  };

  /**
   * Load PDF information from an existing form
   * @param currentFormId - The ID of the form to load PDF details from
   */
  const loadExistingPdf = async (currentFormId?: string) => {
    const targetFormId = currentFormId || formId;
    if (!targetFormId) return;

    try {
      const formData = await getFormById(targetFormId);
      if (formData.pdfUrl) {
        setPdfUrl(formData.pdfUrl);
        setPdfPath(formData.pdfPath || null);
        setPdfFileName(formData.pdfFileName || null);
      }
    } catch (error) {
      console.error('Error loading existing PDF:', error);
    }
  };

  // Effect to load existing PDF when formId changes
  useEffect(() => {
    if (formId) {
      loadExistingPdf(formId);
    }
  }, [formId]);

  return {
    isUploading,
    uploadProgress,
    pdfUrl,
    pdfFile,
    pdfPath,
    pdfFileName,
    uploadPdf,
    resetPdfUpload,
    loadExistingPdf,
  };
};
