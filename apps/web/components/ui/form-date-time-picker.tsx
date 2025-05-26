import React from 'react';

interface FormDateTimePickerProps {
  id?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  error?: string;
  placeholder?: string;
}

export const FormDateTimePicker: React.FC<FormDateTimePickerProps> = ({
  id,
  value,
  onChange,
  error,
  placeholder,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && e.target.value) {
      onChange(new Date(e.target.value));
    }
  };

  return (
    <>
      <input
        type='datetime-local'
        id={id}
        value={value ? new Date(value).toISOString().slice(0, 16) : ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border ${
          error ? 'border-red-500' : 'border-input'
        } bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`}
      />
      {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
    </>
  );
};

FormDateTimePicker.displayName = 'FormDateTimePicker';
