'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { useEventForm } from '@/hooks/useEvent';
import { eventApi } from '@/api/event.api';
import { Event, EventFormValues } from '@/types/event.types';
import { toast } from 'sonner';

import { ArrowLeft, Calendar, Users, MapPin } from 'lucide-react';
import { getAPIErrorMessage } from '@/utils/error';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';

type EventFormClientProps = {
  eventId?: string;
};

export const EventFormClient = ({ eventId }: EventFormClientProps) => {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const isEditMode = !!eventId;

  const {
    control,
    errors,
    shouldDisableButton,
    isLoading,
    handleSubmit,
    handleCreateEvent,
    handleUpdateEvent,
    reset,
  } = useEventForm(event as any, () => {
    router.push('/dashboard/events');
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId]);

  const fetchEvent = async (id: string) => {
    try {
      setFetchLoading(true);
      const data = await eventApi.getEvent(id);

      // Convert ISO strings to Date objects for form
      const transformedData = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : undefined,
      };

      setEvent(transformedData);
      reset(transformedData as EventFormValues);
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
      router.push('/dashboard/events');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = (data: EventFormValues) => {
    if (isEditMode && eventId) {
      handleUpdateEvent(eventId, data);
    } else {
      handleCreateEvent(data);
    }
  };

  if (fetchLoading) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-4 p-4 md:p-8'>
      <div className='flex items-center gap-2 mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='p-0 h-auto'
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className='text-2xl font-bold'>
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data as EventFormValues))}
        className='space-y-8'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='name' className='font-medium'>
                  Name
                </label>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='name'
                      placeholder='Event Name'
                      error={errors.name?.message}
                    />
                  )}
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='description' className='font-medium'>
                  Description
                </label>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id='description'
                      rows={5}
                      placeholder='Event description'
                      error={errors.description?.message}
                    />
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label htmlFor='startTime' className='font-medium'>
                    Start Time
                  </label>
                  <Controller
                    name='startTime'
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        {...field}
                        id='startTime'
                        error={errors.startTime?.message}
                      />
                    )}
                  />
                </div>

                <div className='space-y-2'>
                  <label htmlFor='endTime' className='font-medium'>
                    End Time
                  </label>
                  <Controller
                    name='endTime'
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        {...field}
                        id='endTime'
                        error={errors.endTime?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label htmlFor='location' className='font-medium'>
                    <span className='flex items-center gap-1'>
                      <MapPin size={16} />
                      Location
                    </span>
                  </label>
                  <Controller
                    name='location'
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id='location'
                        placeholder='Event location'
                        error={errors.location?.message}
                      />
                    )}
                  />
                </div>

                <div className='space-y-2'>
                  <label htmlFor='capacity' className='font-medium'>
                    <span className='flex items-center gap-1'>
                      <Users size={16} />
                      Capacity
                    </span>
                  </label>
                  <Controller
                    name='capacity'
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        id='capacity'
                        type='number'
                        className='w-full'
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onChange(
                            e.target.value ? parseInt(e.target.value) : ''
                          )
                        }
                        error={errors.capacity?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label htmlFor='category' className='font-medium'>
                    Category
                  </label>
                  <Controller
                    name='category'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        id='category'
                        placeholder='Select a category'
                        options={[
                          { label: 'Academic', value: 'academic' },
                          { label: 'Social', value: 'social' },
                          { label: 'Cultural', value: 'cultural' },
                          { label: 'Sports', value: 'sports' },
                          { label: 'Other', value: 'other' },
                        ]}
                        error={errors.category?.message}
                      />
                    )}
                  />
                </div>

                <div className='space-y-2'>
                  <label htmlFor='registrationDeadline' className='font-medium'>
                    <span className='flex items-center gap-1'>
                      <Calendar size={16} />
                      Registration Deadline
                    </span>
                  </label>
                  <Controller
                    name='registrationDeadline'
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        {...field}
                        id='registrationDeadline'
                        error={errors.registrationDeadline?.message}
                        placeholder='Optional'
                      />
                    )}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label htmlFor='imageUrl' className='font-medium'>
                  Image URL
                </label>
                <Controller
                  name='imageUrl'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='imageUrl'
                      placeholder='https://example.com/image.jpg'
                      error={errors.imageUrl?.message}
                    />
                  )}
                />
              </div>

              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-center space-x-2'>
                  <Controller
                    name='requireApproval'
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        id='requireApproval'
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor='requireApproval'
                    className='font-medium cursor-pointer'
                  >
                    Require approval for registrations
                  </label>
                </div>

                {isEditMode && (
                  <div className='flex items-center space-x-2'>
                    <Controller
                      name='isPublished'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          id='isPublished'
                          checked={value}
                          onCheckedChange={onChange}
                        />
                      )}
                    />
                    <label
                      htmlFor='isPublished'
                      className='font-medium cursor-pointer'
                    >
                      Publish event
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/dashboard/events')}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={shouldDisableButton}
            loading={isLoading}
          >
            {isEditMode ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
};
