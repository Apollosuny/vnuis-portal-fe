'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, Loader2Icon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { roomApi } from '@/api/room.api';
import { RoomType } from '@/types/room.types';
import { ROUTES } from '@/constants/router';

export const RoomListClient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomApi.getRooms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
    <div className='space-y-4 md:space-y-6'>
      {/* Mobile Title */}
      <div className='block md:hidden mb-4'>
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Room Management
        </h1>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          Manage university rooms for classes, labs, and events
        </p>
      </div>

      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
        <h1 className='hidden md:block text-2xl font-bold'>Room Management</h1>
        <Link
          href={ROUTES.CREATE_ROOM}
          className='bg-primary text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 w-full sm:w-auto'
        >
          <PlusIcon className='h-4 w-4' />
          <span className='hidden sm:inline'>Add New Room</span>
          <span className='sm:hidden'>Add Room</span>
        </Link>
      </div>

      <div className='relative'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <SearchIcon className='w-4 h-4 text-gray-500' />
        </div>
        <input
          type='text'
          className='block w-full p-3 pl-10 text-sm border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent'
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
        <div className='text-center py-8 md:py-10 border rounded-lg'>
          <p className='text-base md:text-lg text-gray-500'>
            {searchTerm
              ? 'No rooms found matching your search'
              : 'No rooms found'}
          </p>
          {!searchTerm && (
            <Link
              href={ROUTES.CREATE_ROOM}
              className='inline-flex items-center gap-2 mt-4 text-primary hover:underline'
            >
              <PlusIcon className='h-4 w-4' />
              Create your first room
            </Link>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
          {filteredRooms.map((room) => (
            <Link
              key={room.roomId}
              href={`/dashboard/rooms/${room.roomId}`}
              className='block border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800'
            >
              <div className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <h3 className='text-base md:text-lg font-semibold truncate pr-2'>
                    {room.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                      room.isAvailable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}
                  >
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-3 truncate'>
                  {room.location}
                </p>
                <div className='flex flex-col sm:flex-row sm:justify-between gap-2 text-xs md:text-sm'>
                  <span className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-center'>
                    Capacity: {room.capacity}
                  </span>
                  <span className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded text-center'>
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
