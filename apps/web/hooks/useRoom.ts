'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { roomApi } from '../api/room.api';
import { roomTimeSlotApi } from '../api/room-time-slot.api';
import { useRoomStore } from '../stores/room.store';
import {
  CreateRoomDto,
  Room,
  RoomType,
  UpdateRoomDto,
} from '../types/room.types';
import {
  CreateTimeSlotDto,
  TimeSlotFormValues,
} from '../types/room-time-slot.types';
import { toast } from 'sonner';

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
        room?.timeSlots?.map((slot) => ({
          startTime: normalizeTime(slot.startTime),
          endTime: normalizeTime(slot.endTime),
          dows: Array.isArray(slot.dows) ? slot.dows : [],
        })) || [],
    },
  });

  // When room changes, update form values
  useEffect(() => {
    if (room) {
      reset({
        name: room.name,
        description: room.description || '',
        capacity: room.capacity,
        location: room.location,
        type: room.type,
        isAvailable: room.isAvailable,
        timeSlots:
          room.timeSlots?.map((slot) => ({
            startTime: normalizeTime(slot.startTime),
            endTime: normalizeTime(slot.endTime),
            dows: Array.isArray(slot.dows) ? slot.dows : [],
          })) || [],
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

  const fetchRoomById = async (roomId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get room details
      const room = await roomApi.getRoom(roomId);

      // Also get the time slots and add them to the room object
      try {
        // Create a current date for time slot fetching
        const currentDate = new Date().toISOString().split('T')[0] || '';
        // Call the API to get time slots
        const timeSlots = await roomTimeSlotApi.getAvailableTimeSlots(
          roomId,
          currentDate
        );
        if (timeSlots && Array.isArray(timeSlots)) {
          // Convert TimeSlotRange to RoomTimeSlot format
          room.timeSlots = timeSlots.map((slot, index) => ({
            id: `temp-id-${index}`, // Generate temporary ID
            roomId: roomId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            dows: slot.dows,
            dowsBit: 0, // Default value, not used in frontend
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
      } catch (timeSlotError) {
        console.error('Error fetching time slots:', timeSlotError);
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
      removeRoom(roomId);
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
