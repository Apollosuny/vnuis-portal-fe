import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';

interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const FormButton = React.forwardRef<HTMLButtonElement, FormButtonProps>(
  (
    {
      className,
      disabled,
      children,
      loading,
      variant = 'default',
      size = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <Button
        className={className}
        disabled={disabled || loading}
        ref={ref}
        variant={variant}
        size={size}
        {...props}
      >
        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {children}
      </Button>
    );
  }
);

FormButton.displayName = 'FormButton';
