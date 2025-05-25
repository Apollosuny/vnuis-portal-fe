'use client';

import { Controller } from 'react-hook-form';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { RoomFormValues, useCreateRoom, useUpdateRoom } from '@/hooks/useRoom';
import { Room, RoomType } from '@/types/room.types';
import { ROUTES } from '@/constants/router';

type RoomFormClientProps = {
  room?: Room | null;
  isEditing?: boolean;
};

export const RoomFormClient = ({
  room,
  isEditing = false,
}: RoomFormClientProps) => {
  const router = useRouter();

  const {
    control,
    errors,
    isLoading: isCreating,
    shouldDisableButton: createDisabled,
    handleSubmit,
    handleCreateRoom,
  } = useCreateRoom((newRoom) => {
    router.push(`/rooms/${newRoom.roomId}`);
  });

  const {
    control: editControl,
    errors: editErrors,
    isLoading: isUpdating,
    shouldDisableButton: updateDisabled,
    handleSubmit: handleEditSubmit,
    handleUpdateRoom,
  } = useUpdateRoom(room || null, (updatedRoom) => {
    router.push(`/rooms/${updatedRoom.roomId}`);
  });

  // Use the appropriate form controller and handler based on whether we're editing or creating
  const formControl = isEditing ? editControl : control;
  const formErrors = isEditing ? editErrors : errors;
  const isSubmitting = isEditing ? isUpdating : isCreating;
  const isDisabled = isEditing ? updateDisabled : createDisabled;

  // Create onSubmit handlers
  const onCreateSubmit = handleSubmit((data: RoomFormValues) =>
    handleCreateRoom(data)
  );
  const onUpdateSubmit = handleEditSubmit((data: RoomFormValues) =>
    handleUpdateRoom(data)
  );

  // Use the appropriate submit handler
  const submitHandler = isEditing ? onUpdateSubmit : onCreateSubmit;

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <Link
          href={
            isEditing && room ? `${ROUTES.ROOMS}/${room.roomId}` : ROUTES.ROOMS
          }
          className='flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        >
          <ArrowLeftIcon className='h-4 w-4' />
          {isEditing ? 'Back to Room Details' : 'Back to Rooms'}
        </Link>
      </div>

      <h1 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
        {isEditing ? 'Edit Room' : 'Create New Room'}
      </h1>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700'>
        <form onSubmit={submitHandler} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              {/* Room Name */}
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
                >
                  Room Name *
                </label>
                <Controller
                  name='name'
                  control={formControl}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id='name'
                        type='text'
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                        placeholder='Enter room name'
                      />
                      {formErrors.name && (
                        <p className='text-red-500 dark:text-red-400 text-sm mt-1'>
                          {formErrors.name.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
                >
                  Description
                </label>
                <Controller
                  name='description'
                  control={formControl}
                  render={({ field }) => (
                    <div>
                      <textarea
                        {...field}
                        id='description'
                        rows={3}
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                        placeholder='Enter room description'
                      />
                      {formErrors.description && (
                        <p className='text-red-500 dark:text-red-400 text-sm mt-1'>
                          {formErrors.description.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Capacity */}
              <div>
                <label
                  htmlFor='capacity'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
                >
                  Capacity *
                </label>
                <Controller
                  name='capacity'
                  control={formControl}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id='capacity'
                        type='number'
                        min={10}
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                        placeholder='Enter room capacity'
                      />
                      {formErrors.capacity && (
                        <p className='text-red-500 dark:text-red-400 text-sm mt-1'>
                          {formErrors.capacity.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className='space-y-4'>
              {/* Location */}
              <div>
                <label
                  htmlFor='location'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
                >
                  Location *
                </label>
                <Controller
                  name='location'
                  control={formControl}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id='location'
                        type='text'
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'
                        placeholder='Enter room location'
                      />
                      {formErrors.location && (
                        <p className='text-red-500 dark:text-red-400 text-sm mt-1'>
                          {formErrors.location.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Room Type */}
              <div>
                <label
                  htmlFor='type'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'
                >
                  Room Type *
                </label>
                <Controller
                  name='type'
                  control={formControl}
                  render={({ field }) => (
                    <div>
                      <select
                        {...field}
                        id='type'
                        className='w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      >
                        <option value=''>Select Room Type</option>
                        <option value={RoomType.CLASSROOM}>Classroom</option>
                        <option value={RoomType.LAB}>Laboratory</option>
                        <option value={RoomType.EVENT}>Event Hall</option>
                      </select>
                      {formErrors.type && (
                        <p className='text-red-500 dark:text-red-400 text-sm mt-1'>
                          {formErrors.type.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Availability */}
              <div>
                <label className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200'>
                  Availability
                </label>
                <Controller
                  name='isAvailable'
                  control={formControl}
                  render={({ field }) => (
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='isAvailable'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 text-primary dark:text-primary-dark bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded'
                      />
                      <label
                        htmlFor='isAvailable'
                        className='text-sm text-gray-900 dark:text-gray-100'
                      >
                        Room is available for booking
                      </label>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <div className='flex justify-end mt-6'>
            <Link
              href={isEditing && room ? `/rooms/${room.roomId}` : '/rooms'}
              className='px-4 py-2 mr-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={isDisabled}
              className='flex items-center gap-2 px-4 py-2 rounded-md bg-primary dark:bg-primary-dark text-white disabled:opacity-50'
            >
              {isSubmitting && <Loader2Icon className='h-4 w-4 animate-spin' />}
              {isEditing ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
