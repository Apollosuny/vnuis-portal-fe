'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Trash2Icon, PlusIcon, AlertCircleIcon } from 'lucide-react';
import { RoomFormValues } from '@/hooks/useRoom';
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

export function TimeSlotForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RoomFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'timeSlots',
  });

  const handleAddTimeSlot = () => {
    append({
      startTime: '08:00',
      endTime: '10:00',
      dows: ['MON', 'WED', 'FRI'],
    });
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

      {fields.length === 0 && (
        <div className='flex items-center gap-2 text-amber-500 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md'>
          <AlertCircleIcon className='h-5 w-5' />
          <span className='text-sm'>
            No time slots configured. Add at least one time slot for this room.
          </span>
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className='p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-4'
        >
          <div className='flex justify-between items-center'>
            <h4 className='font-medium text-gray-800 dark:text-gray-200'>
              Time Slot {index + 1}
            </h4>
            <button
              type='button'
              onClick={() => remove(index)}
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
              <Controller
                name={`timeSlots.${index}.startTime`}
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type='time'
                      className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    />
                    {errors.timeSlots?.[index]?.startTime && (
                      <p className='text-red-500 dark:text-red-400 text-xs mt-1'>
                        {errors.timeSlots[index]?.startTime?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor={`timeSlots.${index}.endTime`}
                className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
              >
                End Time
              </label>
              <Controller
                name={`timeSlots.${index}.endTime`}
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      {...field}
                      type='time'
                      className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    />
                    {errors.timeSlots?.[index]?.endTime && (
                      <p className='text-red-500 dark:text-red-400 text-xs mt-1'>
                        {errors.timeSlots[index]?.endTime?.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <p className='block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200'>
              Days of Week
            </p>
            <Controller
              name={`timeSlots.${index}.dows`}
              control={control}
              render={({ field }) => (
                <div>
                  <div className='flex flex-wrap gap-2'>
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day.value}
                        className={`
                          px-2 py-1 rounded-md text-sm cursor-pointer border 
                          ${
                            field.value?.includes(day.value)
                              ? 'bg-primary dark:bg-primary-dark text-white border-primary dark:border-primary-dark'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        <input
                          type='checkbox'
                          className='sr-only'
                          value={day.value}
                          checked={field.value?.includes(day.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const value = e.target.value;
                            const currentValues = field.value || [];

                            if (checked) {
                              field.onChange([...currentValues, value]);
                            } else {
                              field.onChange(
                                currentValues.filter((val) => val !== value)
                              );
                            }
                          }}
                        />
                        {day.label.substring(0, 3)}
                      </label>
                    ))}
                  </div>
                  {errors.timeSlots?.[index]?.dows && (
                    <p className='text-red-500 dark:text-red-400 text-xs mt-1'>
                      {errors.timeSlots[index]?.dows?.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimeSlotForm;
