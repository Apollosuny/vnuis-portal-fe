'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { roomApi } from '../api/room.api';
import { useRoomStore } from '../stores/room.store';
import {
  CreateRoomDto,
  Room,
  RoomType,
  UpdateRoomDto,
} from '../types/room.types';
import { toast } from 'sonner';

// Form value types
export interface RoomFormValues {
  name: string;
  description: string;
  capacity: number;
  location: string;
  type: RoomType;
  isAvailable: boolean;
}

// Validation schema
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
    },
  });

  const shouldDisableButton = useMemo(
    () => !isDirty || !isValid || isLoading,
    [isDirty, isValid, isLoading]
  );

  const handleCreateRoom = async (data: RoomFormValues) => {
    try {
      setIsLoading(true);
      const newRoom = await roomApi.createRoom(data as CreateRoomDto);
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
      const updatedRoom = await roomApi.updateRoom(
        room.roomId,
        data as UpdateRoomDto
      );
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
      const room = await roomApi.getRoom(roomId);
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
