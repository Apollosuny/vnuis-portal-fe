'use client';

import { useState, useEffect } from 'react';
import { Trash2Icon, PlusIcon, AlertCircleIcon } from 'lucide-react';
import { TimeSlotFormValues } from '@/types/room-time-slot.types';

const DAYS_OF_WEEK = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
  { value: 'SUN', label: 'Sunday' },
];

interface TimeSlotComponentProps {
  value: TimeSlotFormValues[];
  onChange: (newValues: TimeSlotFormValues[]) => void;
  errors?: Record<string, any>;
}

// Helper function to normalize time from ISO format to HH:MM
const normalizeTime = (timeString: string | undefined): string => {
  if (!timeString) return '';
  // If it's an ISO date string, extract just the time part
  if (typeof timeString === 'string' && timeString.includes('T')) {
    const timeParts = timeString.split('T');
    if (timeParts.length > 1 && timeParts[1]) {
      return timeParts[1].substring(0, 5);
    }
  }
  return timeString;
};

export function RoomTimeSlotForm({
  value = [],
  onChange,
  errors = {},
}: TimeSlotComponentProps) {
  // Normalize the initial values
  const normalizedValue = value.map((slot) => ({
    startTime: normalizeTime(slot?.startTime),
    endTime: normalizeTime(slot?.endTime),
    dows: Array.isArray(slot?.dows) ? slot.dows : [],
  }));

  const [timeSlots, setTimeSlots] =
    useState<TimeSlotFormValues[]>(normalizedValue);

  // Update local state when value prop changes from parent
  useEffect(() => {
    const normalizedPropValues = value.map((slot) => ({
      startTime: normalizeTime(slot?.startTime),
      endTime: normalizeTime(slot?.endTime),
      dows: Array.isArray(slot?.dows) ? slot.dows : [],
    }));

    setTimeSlots(normalizedPropValues);
  }, [value]);

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlotFormValues = {
      startTime: '08:00',
      endTime: '10:00',
      dows: ['MON', 'WED', 'FRI'],
    };
    const updatedSlots = [...timeSlots, newSlot];
    setTimeSlots(updatedSlots);
    onChange(updatedSlots);
  };

  const handleRemoveTimeSlot = (index: number) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
    onChange(updatedSlots);
  };

  const updateTimeSlot = (
    index: number,
    field: keyof TimeSlotFormValues,
    value: any
  ) => {
    const updatedSlots = [...timeSlots];
    // Ensure we have valid data
    if (index >= 0 && index < updatedSlots.length) {
      const currentSlot = updatedSlots[index];
      if (currentSlot) {
        // If updating time fields, ensure we have a properly formatted HH:MM value
        let formattedValue = value;
        if (
          (field === 'startTime' || field === 'endTime') &&
          typeof value === 'string'
        ) {
          formattedValue = normalizeTime(value);

          // Ensure we don't store ISO date strings, just the HH:MM part
          if (formattedValue.includes('T')) {
            formattedValue = normalizeTime(formattedValue);
          }
        }

        updatedSlots[index] = {
          startTime: currentSlot.startTime || '',
          endTime: currentSlot.endTime || '',
          dows: Array.isArray(currentSlot.dows) ? currentSlot.dows : [],
          [field]: formattedValue,
        };
        setTimeSlots(updatedSlots);
        onChange(updatedSlots);
      }
    }
  };

  const handleDowToggle = (index: number, dow: string) => {
    if (index >= 0 && index < timeSlots.length) {
      const slot = timeSlots[index];
      if (slot) {
        // Ensure that dows is always an array
        const currentDows = Array.isArray(slot.dows) ? slot.dows : [];
        let newDows: string[];

        if (currentDows.includes(dow)) {
          newDows = currentDows.filter((d) => d !== dow);
        } else {
          newDows = [...currentDows, dow];
        }

        updateTimeSlot(index, 'dows', newDows);
      }
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
          Time Slots
        </h3>
        <button
          type='button'
          onClick={handleAddTimeSlot}
          className='flex items-center gap-1 px-3 py-1 rounded-md bg-primary dark:bg-primary-dark text-white text-sm'
        >
          <PlusIcon className='h-4 w-4' />
          Add Time Slot
        </button>
      </div>

      {timeSlots.length === 0 && (
        <div className='flex items-center gap-2 text-amber-500 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md'>
          <AlertCircleIcon className='h-5 w-5' />
          <span className='text-sm'>
            No time slots configured. Add at least one time slot for this room.
          </span>
        </div>
      )}

      {timeSlots.map((slot, index) => (
        <div
          key={index}
          className='p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-4'
        >
          <div className='flex justify-between items-center'>
            <h4 className='font-medium text-gray-800 dark:text-gray-200'>
              Time Slot {index + 1}
            </h4>
            <button
              type='button'
              onClick={() => handleRemoveTimeSlot(index)}
              className='text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
            >
              <Trash2Icon className='h-4 w-4' />
            </button>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            {/* Start Time */}
            <div>
              <label
                htmlFor={`timeSlots.${index}.startTime`}
                className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
              >
                Start Time
              </label>
              <div>
                <input
                  id={`timeSlots.${index}.startTime`}
                  type='time'
                  value={normalizeTime(slot.startTime)}
                  onChange={(e) =>
                    updateTimeSlot(index, 'startTime', e.target.value)
                  }
                  className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                />
                {errors?.timeSlots?.[index]?.startTime && (
                  <p className='text-red-500 dark:text-red-400 text-xs mt-1'>
                    {errors.timeSlots?.[index]?.startTime?.message}
                  </p>
                )}
              </div>
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor={`timeSlots.${index}.endTime`}
                className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
              >
                End Time
              </label>
              <div>
                <input
                  id={`timeSlots.${index}.endTime`}
                  type='time'
                  value={normalizeTime(slot.endTime)}
                  onChange={(e) =>
                    updateTimeSlot(index, 'endTime', e.target.value)
                  }
                  className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                />
                {errors?.timeSlots?.[index]?.endTime && (
                  <p className='text-red-500 dark:text-red-400 text-xs mt-1'>
                    {errors.timeSlots?.[index]?.endTime?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <p className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200'>
              Days of Week
            </p>
            <div>
              <div className='flex flex-wrap gap-2'>
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected =
                    Array.isArray(slot.dows) && slot.dows.includes(day.value);
                  return (
                    <label
                      key={day.value}
                      className={`
                        px-2 py-1 rounded-md text-sm cursor-pointer border 
                        ${
                          isSelected
                            ? 'bg-primary dark:bg-primary-dark text-white border-primary dark:border-primary-dark'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      <input
                        type='checkbox'
                        className='sr-only'
                        value={day.value}
                        checked={isSelected}
                        onChange={() => handleDowToggle(index, day.value)}
                      />
                      {day.label.substring(0, 3)}
                    </label>
                  );
                })}
              </div>
              {errors?.timeSlots?.[index]?.dows && (
                <p className='text-red-500 dark:text-red-400 text-xs mt-1'>
                  {errors.timeSlots?.[index]?.dows?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
