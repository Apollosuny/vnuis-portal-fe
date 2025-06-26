'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { sanitizeText, escapeHtml } from '@/utils/security';
import { cn } from '@workspace/ui/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  sanitize?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  onSanitizedChange?: (value: string) => void;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      sanitize = true,
      maxLength,
      showCharacterCount = false,
      onChange,
      onSanitizedChange,
      value,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [characterCount, setCharacterCount] = useState(0);

    useEffect(() => {
      setInputValue(value || '');
      setCharacterCount((value as string)?.length || 0);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Apply sanitization if enabled
      if (sanitize) {
        newValue = sanitizeText(newValue);
      }

      // Update character count
      setCharacterCount(newValue.length);

      // Update local state
      setInputValue(newValue);

      // Call original onChange if provided
      if (onChange) {
        e.target.value = newValue;
        onChange(e);
      }

      // Call sanitized change callback
      if (onSanitizedChange) {
        onSanitizedChange(newValue);
      }
    };

    const displayValue = sanitize
      ? escapeHtml(inputValue as string)
      : inputValue;

    return (
      <div className='w-full'>
        {label && (
          <label className='block text-sm font-medium mb-1 text-foreground'>
            {label}
            {props.required && <span className='text-destructive ml-1'>*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={cn(
            'w-full bg-background border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          value={displayValue}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />

        <div className='flex justify-between items-center mt-1'>
          {error && <p className='text-destructive text-sm'>{error}</p>}

          {helperText && !error && (
            <p className='text-muted-foreground text-sm'>{helperText}</p>
          )}

          {showCharacterCount && maxLength && (
            <p
              className={cn(
                'text-xs ml-auto',
                characterCount > maxLength * 0.9
                  ? 'text-orange-500'
                  : 'text-muted-foreground'
              )}
            >
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SecureInput.displayName = 'SecureInput';

// Secure Textarea Component
interface SecureTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  sanitize?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  onSanitizedChange?: (value: string) => void;
}

export const SecureTextarea = forwardRef<
  HTMLTextAreaElement,
  SecureTextareaProps
>(
  (
    {
      className,
      label,
      error,
      helperText,
      sanitize = true,
      maxLength,
      showCharacterCount = false,
      onChange,
      onSanitizedChange,
      value,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [characterCount, setCharacterCount] = useState(0);

    useEffect(() => {
      setInputValue(value || '');
      setCharacterCount((value as string)?.length || 0);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newValue = e.target.value;

      // Apply sanitization if enabled
      if (sanitize) {
        newValue = sanitizeText(newValue);
      }

      // Update character count
      setCharacterCount(newValue.length);

      // Update local state
      setInputValue(newValue);

      // Call original onChange if provided
      if (onChange) {
        e.target.value = newValue;
        onChange(e);
      }

      // Call sanitized change callback
      if (onSanitizedChange) {
        onSanitizedChange(newValue);
      }
    };

    const displayValue = sanitize
      ? escapeHtml(inputValue as string)
      : inputValue;

    return (
      <div className='w-full'>
        {label && (
          <label className='block text-sm font-medium mb-1 text-foreground'>
            {label}
            {props.required && <span className='text-destructive ml-1'>*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={cn(
            'w-full bg-background border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-vertical',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          value={displayValue}
          onChange={handleChange}
          maxLength={maxLength}
          rows={rows}
          {...props}
        />

        <div className='flex justify-between items-center mt-1'>
          {error && <p className='text-destructive text-sm'>{error}</p>}

          {helperText && !error && (
            <p className='text-muted-foreground text-sm'>{helperText}</p>
          )}

          {showCharacterCount && maxLength && (
            <p
              className={cn(
                'text-xs ml-auto',
                characterCount > maxLength * 0.9
                  ? 'text-orange-500'
                  : 'text-muted-foreground'
              )}
            >
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SecureTextarea.displayName = 'SecureTextarea';
