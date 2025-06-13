'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FileUpload } from './file-upload';
import { cn } from '@workspace/ui/lib/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';

interface FormFileUploadProps {
  name: string;
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number;
  showPreview?: boolean;
  className?: string;
  required?: boolean;
}

export const FormFileUpload = React.forwardRef<
  HTMLDivElement,
  FormFileUploadProps
>(
  (
    {
      name,
      label,
      description,
      accept,
      maxSize,
      showPreview,
      className,
      required,
    },
    ref
  ) => {
    const { control } = useFormContext();

    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem ref={ref} className={cn('w-full', className)}>
            {label && (
              <FormLabel
                className={cn({
                  'after:content-["*"] after:ml-0.5 after:text-red-500':
                    required,
                })}
              >
                {label}
              </FormLabel>
            )}
            <FormControl>
              <FileUpload
                accept={accept}
                maxSize={maxSize}
                onChange={(file) => {
                  field.onChange(file);
                }}
                value={field.value}
                showPreview={showPreview}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

FormFileUpload.displayName = 'FormFileUpload';
