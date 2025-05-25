'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  DoorOpen,
  School,
  Beaker,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { useRouter } from 'next/navigation';
import { RoomType } from '@/types/room.types';

// Mock data for rooms
const mockRooms = [
  {
    roomId: '1',
    name: 'Main Lecture Hall',
    description: 'Large lecture hall for main events and lectures',
    capacity: 200,
    location: 'Building A, Ground Floor',
    type: RoomType.CLASSROOM,
    isAvailable: true,
  },
  {
    roomId: '2',
    name: 'Computer Lab 101',
    description: 'Computer lab with 30 workstations',
    capacity: 30,
    location: 'Building B, 1st Floor',
    type: RoomType.LAB,
    isAvailable: true,
  },
  {
    roomId: '3',
    name: 'Conference Room',
    description: 'Medium-sized conference room for meetings',
    capacity: 20,
    location: 'Building C, 2nd Floor',
    type: RoomType.EVENT,
    isAvailable: false,
  },
  {
    roomId: '4',
    name: 'Small Classroom 201',
    description: 'Small classroom for seminars',
    capacity: 40,
    location: 'Building A, 2nd Floor',
    type: RoomType.CLASSROOM,
    isAvailable: true,
  },
  {
    roomId: '5',
    name: 'Chemistry Lab',
    description: 'Lab for chemistry experiments',
    capacity: 25,
    location: 'Building B, 3rd Floor',
    type: RoomType.LAB,
    isAvailable: true,
  },
];

const RoomsPanel = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  // Filter rooms based on search query and filters
  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability =
      availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && room.isAvailable) ||
      (availabilityFilter === 'unavailable' && !room.isAvailable);

    return matchesSearch && matchesType && matchesAvailability;
  });

  const getRoomTypeIcon = (type: RoomType) => {
    switch (type) {
      case RoomType.CLASSROOM:
        return <School className='h-4 w-4' />;
      case RoomType.LAB:
        return <Beaker className='h-4 w-4' />;
      case RoomType.EVENT:
        return <Calendar className='h-4 w-4' />;
      default:
        return <DoorOpen className='h-4 w-4' />;
    }
  };

  const handleViewRoom = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  const handleCreateRoom = () => {
    router.push('/rooms/create');
  };

  return (
    <div className='space-y-4 p-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Rooms</CardTitle>
          <Button onClick={handleCreateRoom}>
            <Plus className='mr-2 h-4 w-4' />
            Add Room
          </Button>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap items-center gap-3 mb-4'>
            <div className='relative flex-1 min-w-[200px]'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search rooms...'
                className='pl-8'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className='w-[180px]'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  {typeFilter && typeFilter !== 'all' ? (
                    <span>Type: {typeFilter}</span>
                  ) : (
                    <span>Filter by Type</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value={RoomType.CLASSROOM}>Classroom</SelectItem>
                <SelectItem value={RoomType.LAB}>Lab</SelectItem>
                <SelectItem value={RoomType.EVENT}>Event</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className='w-[180px]'>
                <div className='flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  {availabilityFilter && availabilityFilter !== 'all' ? (
                    availabilityFilter === 'available' ? (
                      <span>Available</span>
                    ) : (
                      <span>Unavailable</span>
                    )
                  ) : (
                    <span>Filter by Availability</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='available'>Available</SelectItem>
                <SelectItem value='unavailable'>Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-4'>
                      No rooms found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.roomId}>
                      <TableCell className='font-medium'>
                        <div className='font-medium'>{room.name}</div>
                        <div className='text-xs text-muted-foreground'>
                          {room.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getRoomTypeIcon(room.type)}
                          <span>{room.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          <span>{room.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-muted-foreground' />
                          <span>{room.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={room.isAvailable ? 'outline' : 'destructive'}
                          className={
                            room.isAvailable
                              ? 'bg-green-50 text-green-700 hover:bg-green-50'
                              : ''
                          }
                        >
                          {room.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleViewRoom(room.roomId)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <div className='text-xs text-muted-foreground'>
            Showing {filteredRooms.length} of {mockRooms.length} rooms
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoomsPanel;
