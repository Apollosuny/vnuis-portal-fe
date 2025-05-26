'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { DateTime } from 'luxon';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DateTimePickerProps = {
  value?: Date;
  onChange: (date: Date) => void;
  error?: string;
  id?: string;
  placeholder?: string;
};

export const DateTimePicker = ({
  value,
  onChange,
  error,
  id,
  placeholder = 'Pick a date and time',
}: DateTimePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState<string>(
    value ? DateTime.fromJSDate(value).toFormat('HH:mm') : ''
  );

  useEffect(() => {
    if (value) {
      setDate(value);
      setTime(DateTime.fromJSDate(value).toFormat('HH:mm'));
    }
  }, [value]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const datetime = new Date(newDate);
      datetime.setHours(hours, minutes);
      onChange(datetime);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setTime(newTime);

    if (date && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const datetime = new Date(date);
      datetime.setHours(hours, minutes);
      onChange(datetime);
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-full justify-start text-left'
                type='button'
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {date
                  ? DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL)
                  : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Input
            id={id ? `${id}-time` : undefined}
            type='time'
            value={time}
            onChange={handleTimeChange}
            className='w-[120px]'
          />
        </div>
      </div>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
};
