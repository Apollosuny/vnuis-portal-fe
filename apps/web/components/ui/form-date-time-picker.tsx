import React from 'react';
import { DateTime } from 'luxon';

interface FormDateTimePickerProps {
  id?: string;
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
}

export const FormDateTimePicker: React.FC<FormDateTimePickerProps> = ({
  id,
  value,
  onChange,
  error,
  placeholder = 'Select date and time',
}) => {
  const formatForInput = (date: Date | undefined) => {
    if (!date) return '';
    // Convert to local DateTime and format for input
    return DateTime.fromJSDate(date)
      .setZone('local')
      .toFormat("yyyy-MM-dd'T'HH:mm");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && e.target.value) {
      // Parse input as local time and convert to JS Date
      const newDateTime = DateTime.fromISO(e.target.value, { zone: 'local' });
      if (newDateTime.isValid) {
        onChange(newDateTime.toJSDate());
      }
    }
  };

  return (
    <div className='flex flex-col gap-1'>
      <input
        type='datetime-local'
        id={id}
        value={formatForInput(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className={`flex h-9 w-full rounded-md border ${
          error ? 'border-red-500' : 'border-input'
        } bg-background px-3 py-1 text-sm shadow-sm transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:cursor-not-allowed disabled:opacity-50`}
      />
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
};

FormDateTimePicker.displayName = 'FormDateTimePicker';
