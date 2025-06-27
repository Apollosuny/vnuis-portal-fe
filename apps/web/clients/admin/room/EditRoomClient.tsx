'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoomFormClient } from './RoomFormClient';
import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRoomOperations } from '@/hooks/useRoom';

type EditRoomClientProps = {
  roomId: string;
};

export const EditRoomClient = ({ roomId }: EditRoomClientProps) => {
  const router = useRouter();
  const { selectedRoom, isLoading, error, fetchRoomById } = useRoomOperations();

  useEffect(() => {
    fetchRoomById(roomId);
  }, [roomId]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !selectedRoom) {
    return (
      <div className='space-y-4 md:space-y-6'>
        <div className='text-center py-8 md:py-10 border rounded-lg bg-white dark:bg-gray-800'>
          <p className='text-base md:text-lg text-gray-500 dark:text-gray-400 mb-4'>
            {error || 'Room not found'}
          </p>
          <Link
            href='/dashboard/rooms'
            className='bg-primary text-white px-4 py-2 rounded-md inline-block'
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return <RoomFormClient room={selectedRoom} isEditing />;
};
