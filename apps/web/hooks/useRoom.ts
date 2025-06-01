'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DateTime } from 'luxon';
import { roomApi } from '../api/room.api';
import { roomTimeSlotApi } from '../api/room-time-slot.api';
import { useRoomStore } from '../stores/room.store';
import {
  CreateRoomDto,
  Room,
  RoomType,
  UpdateRoomDto,
} from '../types/room.types';
import { TimeSlotFormValues } from '../types/room-time-slot.types';
import { toast } from 'sonner';

// Helper function to normalize time from ISO format to HH:MM using Luxon
const normalizeTime = (timeString: string | undefined): string => {
  if (!timeString) return '';

  // If it's already in HH:MM format, return as is
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  try {
    // Use Luxon to parse and convert timezone
    let dateTime: DateTime;

    // Check if it's an ISO string
    if (timeString.includes('T') || timeString.includes('Z')) {
      // Parse ISO string as UTC
      dateTime = DateTime.fromISO(timeString, { zone: 'utc' });
    } else {
      // Try parsing with other formats
      dateTime = DateTime.fromFormat(timeString, 'HH:mm', { zone: 'utc' });

      // If unsuccessful, try with ISO format
      if (!dateTime.isValid) {
        dateTime = DateTime.fromISO(timeString, { zone: 'utc' });
      }
    }

    if (!dateTime.isValid) {
      console.warn('Invalid time format in normalizeTime:', timeString);
      return timeString;
    }

    // Convert to local timezone and return HH:mm format
    return dateTime.toLocal().toFormat('HH:mm');
  } catch (err) {
    console.error('Error converting time with Luxon in normalizeTime:', err);
    return timeString;
  }
};

// Form value types
export interface RoomFormValues {
  name: string;
  description: string;
  capacity: number;
  location: string;
  type: RoomType;
  isAvailable: boolean;
  timeSlots: TimeSlotFormValues[];
}

// Validation schema
const timeSlotSchema = yup.object({
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
  dows: yup
    .array()
    .of(yup.string().defined())
    .min(1, 'At least one day of week is required')
    .required(),
});

const schema = yup.object({
  name: yup.string().required('Room name is required'),
  description: yup.string().default(''),
  capacity: yup
    .number()
    .typeError('Capacity must be a number')
    .required('Capacity is required')
    .min(10, 'Capacity must be at least 10'),
  location: yup.string().required('Location is required'),
  type: yup
    .mixed<RoomType>()
    .oneOf(Object.values(RoomType))
    .required('Room type is required'),
  isAvailable: yup.boolean().default(true),
  timeSlots: yup.array().of(timeSlotSchema).default([]),
});

// Create Room Hook
export const useCreateRoom = (onSuccess?: (room: Room) => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const addRoom = useRoomStore((state) => state.addRoom);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<RoomFormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      capacity: 10,
      location: '',
      type: RoomType.CLASSROOM,
      isAvailable: true,
      timeSlots: [],
    },
  });

  const shouldDisableButton = useMemo(
    () => !isDirty || !isValid || isLoading,
    [isDirty, isValid, isLoading]
  );

  const handleCreateRoom = async (data: RoomFormValues) => {
    try {
      setIsLoading(true);

      // First create the room
      const newRoom = await roomApi.createRoom({
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        location: data.location,
        type: data.type,
        isAvailable: data.isAvailable,
      } as CreateRoomDto);

      // If we have time slots, create those as well
      if (data.timeSlots && data.timeSlots.length > 0) {
        try {
          await roomTimeSlotApi.createTimeSlots({
            roomId: newRoom.roomId,
            timeRange: data.timeSlots.map((slot) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              dows: slot.dows,
            })),
          });
        } catch (timeSlotError: any) {
          console.error('Error creating time slots:', timeSlotError);
          toast.error('Room created, but time slots could not be created');
        }
      }

      addRoom(newRoom);
      toast.success('Room created successfully');
      reset();
      onSuccess?.(newRoom);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    errors,
    isDirty,
    isValid,
    isLoading,
    shouldDisableButton,
    handleSubmit,
    handleCreateRoom,
    reset,
  };
};

// Update Room Hook
export const useUpdateRoom = (
  room: Room | null,
  onSuccess?: (updatedRoom: Room) => void
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updateRoom = useRoomStore((state) => state.updateRoom);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<RoomFormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      name: room?.name || '',
      description: room?.description || '',
      capacity: room?.capacity || 10,
      location: room?.location || '',
      type: room?.type || RoomType.CLASSROOM,
      isAvailable: room?.isAvailable ?? true,
      timeSlots:
        room?.timeSlots?.map((slot) => {
          // Log the slot information before processing
          console.log('Processing time slot in defaultValues:', slot);

          // Check if dows array is empty and dowsBit is available
          const initialDows: string[] = [];
          if (Array.isArray(slot.dows)) {
            // Only include valid string values
            slot.dows.forEach((day) => {
              if (day !== undefined && day !== null) {
                initialDows.push(String(day));
              }
            });
          }

          let daysList = initialDows;
          console.log('Initial daysList in defaultValues:', daysList);

          // If dows is empty but we have dowsBit, derive days from the bit value
          if (
            daysList.length === 0 &&
            typeof slot.dowsBit === 'number' &&
            slot.dowsBit > 0
          ) {
            console.log(
              'Converting dowsBit to days in defaultValues:',
              slot.dowsBit
            );
            const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const derivedDows: string[] = [];

            // Process each bit (0 = Sunday, 1 = Monday, etc.)
            for (let i = 0; i < 7; i++) {
              if ((slot.dowsBit & (1 << i)) !== 0 && i < dayMap.length) {
                const day = dayMap[i];
                // Type guard to ensure day is defined
                if (day !== undefined) {
                  derivedDows.push(day);
                  console.log(`Found day at bit ${i}: ${day}`);
                }
              }
            }

            // Use derived days if we found any
            if (derivedDows.length > 0) {
              daysList = derivedDows;
              console.log(
                'Using derived days from dowsBit in defaultValues:',
                daysList
              );
            }
          }

          // Ensure all day values are uppercase for consistency
          const uppercaseDays = daysList.map((day) => day.toUpperCase());

          console.log(
            'Final processed daysList in defaultValues:',
            uppercaseDays
          );

          return {
            startTime: normalizeTime(slot.startTime) || '',
            endTime: normalizeTime(slot.endTime) || '',
            dows: uppercaseDays,
          };
        }) || [],
    },
  });

  // When room changes, update form values
  useEffect(() => {
    if (room) {
      // Add debugging for reset operation
      console.log('Resetting form with room data:', room);

      reset({
        name: room.name,
        description: room.description || '',
        capacity: room.capacity,
        location: room.location,
        type: room.type,
        isAvailable: room.isAvailable,
        timeSlots:
          room.timeSlots?.map((slot) => {
            // Log the slot information before processing
            console.log('Processing time slot in reset:', slot);

            // Check if dows array is empty and dowsBit is available
            let daysList = Array.isArray(slot.dows) ? slot.dows : [];
            console.log('Initial daysList:', daysList);

            // If dows is empty but we have dowsBit, derive days from the bit value
            if (
              (!daysList || daysList.length === 0) &&
              typeof slot.dowsBit === 'number' &&
              slot.dowsBit > 0
            ) {
              console.log('Converting dowsBit to days in reset:', slot.dowsBit);
              const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              const derivedDows: string[] = [];

              // Process each bit (0 = Sunday, 1 = Monday, etc.)
              for (let i = 0; i < 7; i++) {
                if ((slot.dowsBit & (1 << i)) !== 0) {
                  // Make sure we're accessing a valid index
                  const day = dayMap[i];
                  if (day) {
                    derivedDows.push(day);
                    console.log(`Found day at bit ${i}: ${day}`);
                  }
                }
              }

              // Use derived days if we found any
              if (derivedDows.length > 0) {
                daysList = derivedDows;
                console.log('Using derived days from dowsBit:', daysList);
              }
            }

            // Ensure all day values are uppercase for consistency
            daysList = daysList
              .filter((day) => day !== undefined && day !== null)
              .map((day) =>
                typeof day === 'string'
                  ? day.toUpperCase()
                  : String(day).toUpperCase()
              );

            console.log('Final processed daysList:', daysList);

            return {
              startTime: normalizeTime(slot.startTime) || '',
              endTime: normalizeTime(slot.endTime) || '',
              dows: daysList,
            };
          }) || [],
      });
    }
  }, [room, reset]);

  const shouldDisableButton = useMemo(
    () => !isDirty || !isValid || isLoading,
    [isDirty, isValid, isLoading]
  );

  const handleUpdateRoom = async (data: RoomFormValues) => {
    if (!room) return;
    try {
      setIsLoading(true);

      // Update the room's basic information
      const updatedRoom = await roomApi.updateRoom(room.roomId, {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        location: data.location,
        type: data.type,
        isAvailable: data.isAvailable,
      } as UpdateRoomDto);

      // If we have time slots, create/update those as well
      if (data.timeSlots && data.timeSlots.length > 0) {
        try {
          await roomTimeSlotApi.createTimeSlots({
            roomId: room.roomId,
            timeRange: data.timeSlots.map((slot) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              dows: slot.dows,
            })),
          });
        } catch (timeSlotError: any) {
          console.error('Error updating time slots:', timeSlotError);
          toast.error('Room updated, but time slots could not be updated');
        }
      }

      updateRoom(room.roomId, updatedRoom);
      toast.success('Room updated successfully');
      onSuccess?.(updatedRoom);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update room');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    errors,
    isDirty,
    isValid,
    isLoading,
    shouldDisableButton,
    handleSubmit,
    handleUpdateRoom,
    reset,
  };
};

// Hook for room operations
export const useRoomOperations = () => {
  const {
    rooms,
    selectedRoom,
    isLoading,
    error,
    setRooms,
    setSelectedRoom,
    removeRoom,
    setLoading,
    setError,
  } = useRoomStore();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomApi.getRooms();
      setRooms(data);
      return data;
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to fetch rooms');
      toast.error(error?.response?.data?.message || 'Failed to fetch rooms');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomById = async (
    roomId: string,
    includeBookings: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Get room details with time slots and optional bookings using the details endpoint
      const room = await roomApi.getRoomWithDetails(
        roomId,
        true,
        includeBookings
      );
      console.log('Fetched room with details:', room);

      // Ensure time slots are properly formatted
      if (room.timeSlots && Array.isArray(room.timeSlots)) {
        console.log('Raw time slots from API:', room.timeSlots);

        room.timeSlots = room.timeSlots.map((slot) => {
          // Create a properly formatted time slot object
          const formattedSlot = {
            ...slot,
            // Keep the original formatted times if they exist
            formattedStartTime:
              slot.formattedStartTime || normalizeTime(slot.startTime),
            formattedEndTime:
              slot.formattedEndTime || normalizeTime(slot.endTime),
            // Make sure startTime and endTime are properly formatted
            startTime: normalizeTime(slot.startTime),
            endTime: normalizeTime(slot.endTime),
          };

          // Handle dows property (days of week)
          let hasDowsProperty = false;

          // First check if we have dows property
          if (slot.dows) {
            hasDowsProperty = true;

            if (Array.isArray(slot.dows)) {
              // If it's already an array, use it directly
              formattedSlot.dows = slot.dows;
            } else if (typeof slot.dows === 'string') {
              // If it's a string, wrap it in an array
              formattedSlot.dows = [slot.dows as string];
            } else if (typeof slot.dows === 'object' && slot.dows !== null) {
              // If it's an object (possibly a getter result), try to extract values
              try {
                const values = Object.values(slot.dows);
                if (Array.isArray(values) && values.length > 0) {
                  formattedSlot.dows = values.map((v) => String(v));
                } else {
                  formattedSlot.dows = [];
                  hasDowsProperty = false;
                }
              } catch (e) {
                console.error('Error processing dows object:', e);
                formattedSlot.dows = [];
                hasDowsProperty = false;
              }
            } else {
              formattedSlot.dows = [];
              hasDowsProperty = false;
            }
          } else {
            formattedSlot.dows = [];
            hasDowsProperty = false;
          }

          // If no valid dows found or dows is empty, try to derive from dowsBit
          if (!hasDowsProperty || formattedSlot.dows.length === 0) {
            if (typeof slot.dowsBit === 'number' && slot.dowsBit > 0) {
              console.log('Converting dowsBit to days:', slot.dowsBit);
              // Use uppercase values to be consistent with our form constants
              const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              const derivedDows: string[] = [];

              // Process each bit (0 = Sunday, 1 = Monday, etc.)
              for (let i = 0; i < 7; i++) {
                // Check if the bit at position i is set and ensure dayMap[i] exists
                if ((slot.dowsBit & (1 << i)) !== 0 && dayMap[i]) {
                  // We know dayMap[i] is defined here because of the condition check
                  derivedDows.push(dayMap[i] as string);
                  console.log(`Found day at bit ${i}: ${dayMap[i]}`);
                }
              }

              // Only use derived days if we actually found some
              if (derivedDows.length > 0) {
                formattedSlot.dows = derivedDows;
                console.log('Days derived from dowsBit:', derivedDows);
              }
            }
          }

          return formattedSlot;
        });
      }

      setSelectedRoom(room);
      return room;
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to fetch room');
      toast.error(error?.response?.data?.message || 'Failed to fetch room');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      setLoading(true);
      await roomApi.deleteRoom(roomId);
      // Ensure roomId is a string before calling removeRoom
      if (roomId) {
        removeRoom(roomId);
      }
      toast.success('Room deleted successfully');
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete room');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    rooms,
    selectedRoom,
    isLoading,
    error,
    fetchRooms,
    fetchRoomById,
    deleteRoom,
    setSelectedRoom,
  };
};
