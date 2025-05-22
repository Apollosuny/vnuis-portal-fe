'use client';

import { useState, useEffect } from 'react';
import { useRoomOperations } from '../../hooks/useRoom';
import { PlusIcon, Loader2Icon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { RoomType } from '../../types/room.types';

export const RoomListClient = () => {
  const { rooms, isLoading, fetchRooms } = useRoomOperations();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className='container mx-auto py-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Room Management</h1>
        <Link
          href='/rooms/create'
          className='bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2'
        >
          <PlusIcon className='h-4 w-4' />
          Add New Room
        </Link>
      </div>

      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <SearchIcon className='w-4 h-4 text-gray-500' />
        </div>
        <input
          type='text'
          className='block w-full p-2 pl-10 text-sm border border-input rounded-lg'
          placeholder='Search rooms by name or location...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className='text-center py-10 border rounded-lg'>
          <p className='text-lg text-gray-500'>No rooms found</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredRooms.map((room) => (
            <Link
              key={room.roomId}
              href={`/rooms/${room.roomId}`}
              className='block border rounded-lg overflow-hidden hover:shadow-md transition'
            >
              <div className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-lg font-semibold'>{room.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      room.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className='text-sm text-gray-500 mb-2'>{room.location}</p>
                <div className='flex justify-between text-sm'>
                  <span className='bg-gray-100 px-2 py-1 rounded'>
                    Capacity: {room.capacity}
                  </span>
                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                    {getRoomTypeLabel(room.type)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
