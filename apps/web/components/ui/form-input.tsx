import React from 'react';
import { Input } from '@workspace/ui/components/input';

interface FormInputProps extends React.ComponentProps<'input'> {
  error?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <>
        <Input
          className={`${className} ${error ? 'border-red-500' : ''}`}
          ref={ref}
          {...props}
        />
        {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
      </>
    );
  }
);

FormInput.displayName = 'FormInput';
