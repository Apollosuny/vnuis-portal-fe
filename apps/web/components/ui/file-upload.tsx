import React, { useState, useRef, ChangeEvent } from 'react';
import { FileX, FileCheck, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onChange?: (file: File | null) => void;
  onUploadComplete?: (url: string) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  error?: string;
  value?: string;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*/*',
  maxSize = 10485760, // Default 10MB
  onChange,
  onUploadComplete,
  className,
  disabled = false,
  label = 'Upload file',
  description = 'Drag and drop or click to upload',
  error,
  value,
  showPreview = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    error || null
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const fileType = file.type;
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return mainType ? fileType.startsWith(mainType) : false;
        }
        return type === fileType;
      });

      if (!isAccepted) {
        setErrorMessage(`File type not accepted. Accepted: ${accept}`);
        return false;
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setErrorMessage(`File too large. Maximum size: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      setFile(file);
      setErrorMessage(null);

      // Generate preview for supported file types
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf' && showPreview) {
        setPreview(URL.createObjectURL(file));
      } else {
        // For non-previewable files, just show the name
        setPreview(null);
      }

      onChange && onChange(file);
      return true;
    }
    setFile(null);
    setPreview(null);
    onChange && onChange(null);
    return false;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const dt = e.dataTransfer;
    const droppedFile = dt.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange && onChange(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
          {label}
        </div>
      )}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-dashed rounded-md transition-all cursor-pointer',
          {
            'border-primary bg-primary/5': isDragging,
            'border-destructive bg-destructive/5': errorMessage,
            'border-input hover:bg-accent/5': !isDragging && !errorMessage,
            'cursor-not-allowed opacity-60': disabled,
          }
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type='file'
          className='hidden'
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
        />

        {isUploading ? (
          <div className='flex flex-col items-center p-4 space-y-2'>
            <Loader2 className='size-10 text-primary animate-spin' />
            <span className='text-sm text-muted-foreground'>
              Uploading... {uploadProgress}%
            </span>
            <div className='w-[200px] h-2 bg-secondary rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary transition-all duration-300'
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : file &&
          preview &&
          file.type === 'application/pdf' &&
          showPreview ? (
          <div className='flex flex-col items-center p-4 space-y-2 w-full'>
            <div className='flex items-center justify-between w-full px-4'>
              <div className='flex items-center'>
                <FileCheck className='w-6 h-6 text-primary mr-2' />
                <span className='text-sm font-medium truncate max-w-[200px]'>
                  {file.name}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleRemoveFile}
                      disabled={disabled}
                    >
                      <FileX className='w-4 h-4 text-destructive' />
                      <span className='sr-only'>Remove file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className='w-full px-4'>
              <object
                data={preview}
                type='application/pdf'
                className='w-full h-[200px] border rounded'
              >
                <p>Your browser does not support PDF preview.</p>
              </object>
            </div>
          </div>
        ) : file ? (
          <div className='flex flex-col items-center p-4 space-y-2'>
            <FileCheck className='w-10 h-10 text-primary' />
            <span className='text-sm font-medium truncate max-w-[200px]'>
              {file.name}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className='flex flex-col items-center p-4 space-y-2'>
            <Upload className='w-10 h-10 text-muted-foreground' />
            <span className='text-sm text-muted-foreground text-center'>
              {description}
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className='flex items-center text-sm font-medium text-destructive'>
          <AlertCircle className='w-4 h-4 mr-1' />
          {errorMessage}
        </div>
      )}
    </div>
  );
};
