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
      <div className='container mx-auto py-6'>
        <div className='text-center py-10 border rounded-lg'>
          <p className='text-lg text-gray-500 mb-4'>
            {error || 'Room not found'}
          </p>
          <Link
            href='/rooms'
            className='bg-primary text-white px-4 py-2 rounded-md'
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return <RoomFormClient room={selectedRoom} isEditing />;
};
