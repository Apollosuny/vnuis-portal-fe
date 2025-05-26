import React from 'react';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <>
      <textarea
        className={`flex w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        ref={ref}
        {...props}
      />
      {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
    </>
  );
});

FormTextarea.displayName = 'FormTextarea';
