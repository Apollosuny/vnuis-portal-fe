import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

interface FormSelectProps {
  error?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  error,
  options,
  placeholder,
  className,
  value,
  onChange,
  disabled,
  ...props
}) => {
  return (
    <>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={`${className || ''} ${error ? 'border-red-500' : ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
    </>
  );
};

FormSelect.displayName = 'FormSelect';
