import { useState, useMemo } from 'react';
import { useForm, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, number, boolean, date } from 'yup';
import { useRouter } from 'next/navigation';
import { DateTime } from 'luxon';
import { eventApi } from '@/api/event.api';
import { EventFormValues, EventFilterValues } from '@/types/event.types';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import type { CreateEventDto } from '@/api/event.api';

const eventSchema = object({
  name: string().required('Event name is required'),
  description: string().required('Description is required'),
  startTime: date().required('Start time is required'),
  endTime: date()
    .required('End time is required')
    .test(
      'is-after-start',
      'End time must be after start time',
      (value, context) => {
        const { startTime } = context.parent;
        if (!startTime || !value) return true;
        // Compare timestamps to avoid timezone issues
        return value.getTime() > startTime.getTime();
      }
    ),
  location: string().required('Location is required'),
  capacity: number()
    .required('Capacity is required')
    .positive('Capacity must be positive')
    .integer('Capacity must be an integer'),
  isPublished: boolean().default(false),
  imageUrl: string().url('Image URL must be a valid URL').optional(),
  category: string().optional(),
  registrationDeadline: date()
    .optional()
    .nullable()
    .test(
      'is-before-start',
      'Registration deadline must be before event start time',
      (value, context) => {
        const { startTime } = context.parent;
        if (!startTime || !value) return true;
        // Compare timestamps to avoid timezone issues
        return value.getTime() < startTime.getTime();
      }
    ),
  requireApproval: boolean().default(false),
  metadata: object().optional(),
});

// Initialize defaultValues with local timezone
const now = DateTime.local();
const defaultValues: EventFormValues = {
  name: '',
  description: '',
  startTime: now.toJSDate(),
  endTime: now.plus({ hours: 2 }).toJSDate(),
  location: '',
  capacity: 50,
  isPublished: false,
  requireApproval: false,
};

export const useEventForm = (
  initialValues?: Partial<EventFormValues>,
  onSuccess?: () => void
) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
    watch,
  } = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema as any),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
    mode: 'onChange',
  });

  const shouldDisableButton = useMemo(
    () => !isDirty || !isValid || isLoading,
    [isDirty, isValid, isLoading]
  );

  const convertToApiFormat = (data: EventFormValues): CreateEventDto => {
    // Convert local dates to UTC ISO strings while preserving time
    const startTimeISO = DateTime.fromJSDate(data.startTime)
      .setZone('utc', { keepLocalTime: true })
      .toISO();
    const endTimeISO = DateTime.fromJSDate(data.endTime)
      .setZone('utc', { keepLocalTime: true })
      .toISO();

    // Make sure we have valid ISO strings for required fields
    if (!startTimeISO || !endTimeISO) {
      throw new Error('Invalid date format');
    }

    // Handle optional registration deadline
    let registrationDeadlineISO: string | undefined;

    if (data.registrationDeadline instanceof Date) {
      const isoString = DateTime.fromJSDate(data.registrationDeadline)
        .setZone('utc', { keepLocalTime: true })
        .toISO();
      if (isoString) {
        registrationDeadlineISO = isoString;
      }
    }

    return {
      ...data,
      startTime: startTimeISO,
      endTime: endTimeISO,
      registrationDeadline: registrationDeadlineISO,
    };
  };

  const handleCreateEvent = async (data: EventFormValues) => {
    try {
      setIsLoading(true);
      const apiData = convertToApiFormat(data);
      await eventApi.createEvent(apiData);
      toast.success('Event created successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (id: string, data: EventFormValues) => {
    try {
      setIsLoading(true);
      const apiData = convertToApiFormat(data);
      await eventApi.updateEvent(id, apiData);
      toast.success('Event updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    errors,
    shouldDisableButton,
    isLoading,
    handleSubmit: rhfHandleSubmit,
    handleCreateEvent,
    handleUpdateEvent,
    reset,
    watch,
  };
};

// Hook for event registrations
export const useEventRegistration = (
  eventId: string,
  onSuccess?: () => void
) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (additionalInfo?: Record<string, any>) => {
    try {
      setIsLoading(true);
      await eventApi.registerEvent({
        eventId,
        additionalInfo,
      });
      toast.success('Event registration successful');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (registrationId: string) => {
    try {
      setIsLoading(true);
      await eventApi.cancelRegistration(registrationId);
      toast.success('Registration cancelled successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleRegister,
    handleCancel,
  };
};

// Hook for managing event registrations as admin
export const useEventRegistrationManagement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (
    registrationId: string,
    status: string,
    remarks?: string,
    onSuccess?: () => void
  ) => {
    try {
      setIsLoading(true);
      await eventApi.updateRegistrationStatus(registrationId, {
        status: status as any,
        remarks,
      });
      toast.success('Registration status updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleUpdateStatus,
  };
};

// Hook for filtering events
export const useEventFilter = (
  initialValues?: Partial<EventFilterValues>
): {
  control: Control<EventFilterValues>;
  handleFilter: (e: React.FormEvent<HTMLFormElement>) => void;
  resetFilter: () => void;
} => {
  const { control, handleSubmit, reset } = useForm<EventFilterValues>({
    defaultValues: initialValues || {
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
      category: '',
      isPublished: undefined,
    },
  });

  const onSubmit = (data: EventFilterValues) => {
    // Filter functionality would go here - typically updating URL params
    // or a state that triggers a refetch with filters
    console.log('Filter data:', data);
  };

  const resetFilter = () => {
    reset({
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
      category: '',
      isPublished: undefined,
    });
  };

  return {
    control,
    handleFilter: handleSubmit(onSubmit),
    resetFilter,
  };
};
