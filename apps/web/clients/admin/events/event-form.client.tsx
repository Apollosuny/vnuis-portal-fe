'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { useEventForm } from '@/hooks/useEvent';
import { eventApi } from '@/api/event.api';
import { Event, EventFormValues } from '@/types/event.types';
import { toast } from 'sonner';
import { DateTime } from 'luxon';

import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Info,
  Clock,
  Image as ImageIcon,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getAPIErrorMessage } from '@/utils/error';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@workspace/ui/components/card';

// Import custom form components
import { FormInput } from '@/components/ui/form-input';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormDateTimePicker } from '@/components/ui/form-date-time-picker';
import { FormSelect } from '@/components/ui/form-select';
import { FormSwitch } from '@/components/ui/form-switch';
import { FormButton } from '@/components/ui/form-button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Badge } from '@workspace/ui/components/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';

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
    watch,
  } = useEventForm(event as any, () => {
    router.push('/dashboard/events');
  });

  // Get values for preview
  const eventName = watch('name');
  const eventCategory = watch('category');
  const eventLocation = watch('location');
  const eventImage = watch('imageUrl');

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId]);

  const fetchEvent = async (id: string) => {
    try {
      setFetchLoading(true);
      const data = await eventApi.getEvent(id);

      // Convert UTC dates from API to local dates while preserving time
      const transformedData = {
        ...data,
        startTime: DateTime.fromISO(data.startTime)
          .setZone('local', { keepLocalTime: true })
          .toJSDate(),
        endTime: DateTime.fromISO(data.endTime)
          .setZone('local', { keepLocalTime: true })
          .toJSDate(),
        registrationDeadline: data.registrationDeadline
          ? DateTime.fromISO(data.registrationDeadline)
              .setZone('local', { keepLocalTime: true })
              .toJSDate()
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
    // Convert local dates to UTC before sending to API, preserving the time
    const utcData = {
      ...data,
      startTime: DateTime.fromJSDate(data.startTime)
        .setZone('utc', { keepLocalTime: true })
        .toJSDate(),
      endTime: DateTime.fromJSDate(data.endTime)
        .setZone('utc', { keepLocalTime: true })
        .toJSDate(),
      registrationDeadline: data.registrationDeadline
        ? DateTime.fromJSDate(data.registrationDeadline)
            .setZone('utc', { keepLocalTime: true })
            .toJSDate()
        : undefined,
    };

    if (isEditMode && eventId) {
      handleUpdateEvent(eventId, utcData);
    } else {
      handleCreateEvent(utcData);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      social: 'bg-purple-100 text-purple-800',
      cultural: 'bg-amber-100 text-amber-800',
      sports: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (fetchLoading) {
    return (
      <div className='flex justify-center items-center min-h-[40vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6 p-4 md:p-6 max-w-[1200px] mx-auto'>
      <div className='flex items-center gap-2 mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='p-2 h-10 w-10 rounded-full'
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className='text-muted-foreground text-sm mt-1'>
            {isEditMode
              ? 'Update the details of your existing event'
              : 'Fill out the form to create a new event for your organization'}
          </p>
        </div>
      </div>

      <Tabs defaultValue='details' className='w-full'>
        <TabsList className='mb-6'>
          <TabsTrigger value='details'>Event Details</TabsTrigger>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
        </TabsList>
        <TabsContent value='details'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Main Content - 2/3 width */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Basic Details Card */}
                <Card className='overflow-hidden border-l-4 border-l-primary'>
                  <CardHeader className='bg-muted/40 pb-3'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardTitle className='flex items-center gap-2'>
                          <Info size={18} />
                          Basic Information
                        </CardTitle>
                        <CardDescription>
                          The essential details about your event
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='p-6 space-y-5'>
                    <div className='space-y-3'>
                      <label
                        htmlFor='name'
                        className='font-medium text-sm flex items-center'
                      >
                        Event Name
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className='h-4 w-4 ml-1 text-muted-foreground' />
                            </TooltipTrigger>
                            <TooltipContent>
                              Choose a clear, descriptive name for your event
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className='text-destructive ml-1'>*</span>
                      </label>
                      <Controller
                        name='name'
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            {...field}
                            id='name'
                            placeholder='e.g., Annual Student Conference 2025'
                            error={errors.name?.message}
                          />
                        )}
                      />
                    </div>

                    <div className='space-y-3'>
                      <label
                        htmlFor='description'
                        className='font-medium text-sm flex items-center'
                      >
                        Description
                        <span className='text-destructive ml-1'>*</span>
                      </label>
                      <Controller
                        name='description'
                        control={control}
                        render={({ field }) => (
                          <FormTextarea
                            {...field}
                            id='description'
                            rows={5}
                            placeholder='Provide detailed information about your event, including what participants can expect'
                            error={errors.description?.message}
                          />
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='space-y-3'>
                        <label
                          htmlFor='location'
                          className='font-medium text-sm flex items-center'
                        >
                          <MapPin
                            size={16}
                            className='mr-1 text-muted-foreground'
                          />
                          Location
                          <span className='text-destructive ml-1'>*</span>
                        </label>
                        <Controller
                          name='location'
                          control={control}
                          render={({ field }) => (
                            <FormInput
                              {...field}
                              id='location'
                              placeholder='e.g., Main Auditorium, Building A'
                              error={errors.location?.message}
                            />
                          )}
                        />
                      </div>

                      <div className='space-y-3'>
                        <label
                          htmlFor='category'
                          className='font-medium text-sm flex items-center'
                        >
                          <Layers
                            size={16}
                            className='mr-1 text-muted-foreground'
                          />
                          Category
                          <span className='text-destructive ml-1'>*</span>
                        </label>
                        <Controller
                          name='category'
                          control={control}
                          render={({ field }) => (
                            <FormSelect
                              {...field}
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
                    </div>

                    <div className='space-y-3'>
                      <label
                        htmlFor='imageUrl'
                        className='font-medium text-sm flex items-center'
                      >
                        <ImageIcon
                          size={16}
                          className='mr-1 text-muted-foreground'
                        />
                        Event Image URL
                      </label>
                      <Controller
                        name='imageUrl'
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            {...field}
                            id='imageUrl'
                            placeholder='https://example.com/image.jpg'
                            error={errors.imageUrl?.message}
                          />
                        )}
                      />
                      <p className='text-xs text-muted-foreground'>
                        Recommended image size: 1200×630 pixels
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Timing Details */}
                <Card className='overflow-hidden border-l-4 border-l-indigo-500'>
                  <CardHeader className='bg-muted/40 pb-3'>
                    <CardTitle className='flex items-center gap-2'>
                      <Clock size={18} />
                      Schedule & Timing
                    </CardTitle>
                    <CardDescription>
                      Set when your event starts and ends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='p-6 space-y-5'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      <div className='space-y-3'>
                        <label
                          htmlFor='startTime'
                          className='font-medium text-sm flex items-center'
                        >
                          Start Time
                          <span className='text-destructive ml-1'>*</span>
                        </label>
                        <Controller
                          name='startTime'
                          control={control}
                          render={({ field }) => (
                            <FormDateTimePicker
                              {...field}
                              id='startTime'
                              error={errors.startTime?.message}
                            />
                          )}
                        />
                      </div>

                      <div className='space-y-3'>
                        <label
                          htmlFor='endTime'
                          className='font-medium text-sm flex items-center'
                        >
                          End Time
                          <span className='text-destructive ml-1'>*</span>
                        </label>
                        <Controller
                          name='endTime'
                          control={control}
                          render={({ field }) => (
                            <FormDateTimePicker
                              {...field}
                              id='endTime'
                              error={errors.endTime?.message}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <label
                        htmlFor='registrationDeadline'
                        className='font-medium text-sm flex items-center'
                      >
                        <Calendar
                          size={16}
                          className='mr-1 text-muted-foreground'
                        />
                        Registration Deadline
                      </label>
                      <Controller
                        name='registrationDeadline'
                        control={control}
                        render={({ field }) => (
                          <FormDateTimePicker
                            {...field}
                            id='registrationDeadline'
                            error={errors.registrationDeadline?.message}
                            placeholder='Optional'
                          />
                        )}
                      />
                      <p className='text-xs text-muted-foreground'>
                        Leave blank if registration is open until the event
                        starts
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - 1/3 width */}
              <div className='space-y-6'>
                {/* Registration Settings */}
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Users size={18} />
                      Capacity & Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-5'>
                    <div className='space-y-3'>
                      <label
                        htmlFor='capacity'
                        className='font-medium text-sm flex items-center'
                      >
                        Participant Capacity
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className='h-4 w-4 ml-1 text-muted-foreground' />
                            </TooltipTrigger>
                            <TooltipContent>
                              Maximum number of participants allowed
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <Controller
                        name='capacity'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <FormInput
                            id='capacity'
                            type='number'
                            className='w-full'
                            value={value}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              onChange(
                                e.target.value ? parseInt(e.target.value) : ''
                              )
                            }
                            error={errors.capacity?.message}
                            placeholder='e.g., 100'
                          />
                        )}
                      />
                      <p className='text-xs text-muted-foreground'>
                        Leave empty for unlimited capacity
                      </p>
                    </div>

                    <div className='space-y-2 pt-2'>
                      <div className='flex items-center space-x-2 p-3 bg-muted/30 rounded-lg'>
                        <Controller
                          name='requireApproval'
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <FormSwitch
                              id='requireApproval'
                              checked={value}
                              onCheckedChange={onChange}
                            />
                          )}
                        />
                        <div>
                          <label
                            htmlFor='requireApproval'
                            className='font-medium cursor-pointer text-sm'
                          >
                            Require registration approval
                          </label>
                          <p className='text-xs text-muted-foreground'>
                            Manually approve participant registrations
                          </p>
                        </div>
                      </div>
                    </div>

                    {isEditMode && (
                      <div className='space-y-2 pt-2'>
                        <div className='flex items-center space-x-2 p-3 bg-muted/30 rounded-lg'>
                          <Controller
                            name='isPublished'
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <FormSwitch
                                id='isPublished'
                                checked={value}
                                onCheckedChange={onChange}
                              />
                            )}
                          />
                          <div>
                            <label
                              htmlFor='isPublished'
                              className='font-medium cursor-pointer text-sm'
                            >
                              Publish event
                            </label>
                            <p className='text-xs text-muted-foreground'>
                              Make this event visible to users
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Help card */}
                <Card className='bg-muted/30 border-dashed'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <AlertCircle size={18} />
                      Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2 text-sm'>
                      <li className='flex gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-600 mt-0.5' />
                        <span>Use descriptive titles to attract attendees</span>
                      </li>
                      <li className='flex gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-600 mt-0.5' />
                        <span>
                          Add a detailed description with all important
                          information
                        </span>
                      </li>
                      <li className='flex gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-green-600 mt-0.5' />
                        <span>
                          Include a high-quality image for better visibility
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/dashboard/events')}
              >
                Cancel
              </Button>
              <FormButton
                type='submit'
                disabled={shouldDisableButton}
                loading={isLoading}
              >
                {isEditMode ? 'Update Event' : 'Create Event'}
              </FormButton>
            </div>
          </form>
        </TabsContent>

        <TabsContent value='preview'>
          <div className='max-w-3xl mx-auto'>
            <Card className='overflow-hidden'>
              {eventImage ? (
                <div className='h-48 overflow-hidden'>
                  <img
                    src={eventImage}
                    alt='Event cover'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/800x400?text=Event+Image';
                    }}
                  />
                </div>
              ) : (
                <div className='h-48 bg-muted flex items-center justify-center'>
                  <ImageIcon
                    size={48}
                    className='text-muted-foreground opacity-30'
                  />
                  <p className='text-muted-foreground ml-2'>
                    No image provided
                  </p>
                </div>
              )}

              <CardContent className='p-6'>
                <div className='flex flex-col md:flex-row justify-between gap-4'>
                  <div className='space-y-4 flex-1'>
                    <div>
                      <h2 className='text-2xl font-bold'>
                        {eventName || 'Event Name'}
                      </h2>
                      {eventCategory && (
                        <Badge
                          className={`mt-2 ${getCategoryColor(eventCategory)}`}
                        >
                          {eventCategory.charAt(0).toUpperCase() +
                            eventCategory.slice(1)}
                        </Badge>
                      )}
                    </div>

                    {eventLocation && (
                      <div className='flex items-start gap-2 text-sm'>
                        <MapPin
                          size={16}
                          className='mt-0.5 text-muted-foreground'
                        />
                        <span>{eventLocation}</span>
                      </div>
                    )}

                    <p className='text-sm text-muted-foreground mt-2'>
                      This is a preview of how your event may appear to users.
                      Complete all fields to see a more detailed preview.
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className='bg-muted/30 px-6 py-4 flex justify-between'>
                <p className='text-sm text-muted-foreground'>Preview mode</p>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    document
                      .querySelector('[data-value="details"]')
                      ?.dispatchEvent(
                        new MouseEvent('click', { bubbles: true })
                      )
                  }
                >
                  Return to edit
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
