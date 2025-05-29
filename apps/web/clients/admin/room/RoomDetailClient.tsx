'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2Icon, EditIcon, TrashIcon, ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRoomOperations } from '@/hooks/useRoom';
import { RoomType } from '@/types/room.types';

type RoomDetailClientProps = {
  roomId: string;
};

export const RoomDetailClient = ({ roomId }: RoomDetailClientProps) => {
  const router = useRouter();
  const { selectedRoom, isLoading, fetchRoomById, deleteRoom } =
    useRoomOperations();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRoomById(roomId);
  }, [roomId]);

  const handleDelete = async () => {
    if (!selectedRoom) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this room?'
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    const success = await deleteRoom(roomId);
    setIsDeleting(false);

    if (success) {
      router.push('/rooms');
    }
  };

  const getRoomTypeLabel = (type: RoomType) => {
    switch (type) {
      case RoomType.CLASSROOM:
        return 'Classroom';
      case RoomType.LAB:
        return 'Laboratory';
      case RoomType.EVENT:
        return 'Event Hall';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className='text-center py-10'>
        <p className='text-lg text-gray-500'>Room not found</p>
        <Link
          href='/rooms'
          className='text-primary hover:underline mt-4 inline-block'
        >
          Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <Link
          href='/dashboard/rooms'
          className='text-gray-500 hover:text-gray-700 flex items-center gap-1'
        >
          <ArrowLeftIcon className='h-4 w-4' />
          Back to Rooms
        </Link>
      </div>

      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>{selectedRoom.name}</h1>
          <p className='text-gray-500'>{selectedRoom.location}</p>
        </div>
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/rooms/${roomId}/edit`}
            className='bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2'
          >
            <EditIcon className='h-4 w-4' />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2'
          >
            {isDeleting ? (
              <Loader2Icon className='h-4 w-4 animate-spin' />
            ) : (
              <TrashIcon className='h-4 w-4' />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6 border'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-lg font-semibold mb-4'>Room Details</h2>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500'>Status</p>
                <span
                  className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                    selectedRoom.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedRoom.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div>
                <p className='text-sm text-gray-500'>Room Type</p>
                <p className='font-medium'>
                  {getRoomTypeLabel(selectedRoom.type)}
                </p>
              </div>

              <div>
                <p className='text-sm text-gray-500'>Capacity</p>
                <p className='font-medium'>{selectedRoom.capacity} people</p>
              </div>

              {selectedRoom.description && (
                <div>
                  <p className='text-sm text-gray-500'>Description</p>
                  <p className='font-medium'>{selectedRoom.description}</p>
                </div>
              )}

              <div>
                <p className='text-sm text-gray-500'>Created</p>
                <p className='font-medium'>
                  {new Date(selectedRoom.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className='text-sm text-gray-500'>Last Updated</p>
                <p className='font-medium'>
                  {new Date(selectedRoom.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className='text-lg font-semibold mb-4'>Time Slots</h2>
            {selectedRoom.timeSlots && selectedRoom.timeSlots.length > 0 ? (
              <div className='space-y-3'>
                {selectedRoom.timeSlots.map((slot) => (
                  <div key={slot.id} className='p-3 border rounded-lg'>
                    <p className='font-medium'>
                      {new Date(slot.startTime).toLocaleTimeString()} -{' '}
                      {new Date(slot.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No time slots available</p>
            )}

            <h2 className='text-lg font-semibold mt-6 mb-4'>Recent Bookings</h2>
            {selectedRoom.bookings && selectedRoom.bookings.length > 0 ? (
              <div className='space-y-3'>
                {selectedRoom.bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className='p-3 border rounded-lg'>
                    <div className='flex justify-between mb-1'>
                      <p className='font-medium'>
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className='text-sm'>{booking.purpose}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500'>No recent bookings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
