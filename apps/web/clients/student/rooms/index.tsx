'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  Search,
  Filter,
  Clock,
  Users,
  Calendar,
  Wifi,
  Computer,
  PanelTop,
  Eye,
  DoorOpen,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

// Mock data for rooms
const rooms = [
  {
    id: 'R001',
    name: 'Study Room 101',
    building: 'Main Library',
    floor: '1st Floor',
    capacity: 4,
    type: 'Study Room',
    features: ['Whiteboard', 'Projector', 'Air conditioning', 'Natural light'],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '09:00', endTime: '11:00' },
      { date: 'May 28, 2025', startTime: '13:00', endTime: '15:00' },
      { date: 'May 29, 2025', startTime: '14:00', endTime: '16:00' },
    ],
    description:
      'A quiet study room ideal for group projects and collaborative work.',
    image: '/assets/room-101.jpg',
    rating: 4.5,
    reviews: 28,
  },
  {
    id: 'R002',
    name: 'Conference Room A',
    building: 'Business School',
    floor: '2nd Floor',
    capacity: 12,
    type: 'Conference Room',
    features: [
      'Video conferencing',
      'Smart board',
      'Coffee machine',
      'Adjustable lighting',
    ],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '15:00', endTime: '17:00' },
      { date: 'May 29, 2025', startTime: '09:00', endTime: '11:00' },
      { date: 'May 29, 2025', startTime: '13:00', endTime: '15:00' },
    ],
    description:
      'Professional conference room equipped with advanced presentation technology.',
    image: '/assets/conference-a.jpg',
    rating: 4.7,
    reviews: 42,
  },
  {
    id: 'R003',
    name: 'Study Room 102',
    building: 'Main Library',
    floor: '1st Floor',
    capacity: 6,
    type: 'Study Room',
    features: ['Whiteboard', 'PC workstations', 'Adjustable desks'],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '11:00', endTime: '13:00' },
      { date: 'May 28, 2025', startTime: '14:00', endTime: '16:00' },
      { date: 'May 29, 2025', startTime: '10:00', endTime: '12:00' },
    ],
    description:
      'Comfortable study space with computer workstations and collaborative space.',
    image: '/assets/room-102.jpg',
    rating: 4.3,
    reviews: 19,
  },
  {
    id: 'R004',
    name: 'Multimedia Lab',
    building: 'Technology Center',
    floor: '3rd Floor',
    capacity: 20,
    type: 'Laboratory',
    features: [
      'Audio/Video equipment',
      'Editing software',
      'High-resolution monitors',
      'Sound recording booth',
    ],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '13:00', endTime: '15:00' },
      { date: 'May 29, 2025', startTime: '09:00', endTime: '12:00' },
    ],
    description:
      'Fully equipped multimedia laboratory for audio and video production projects.',
    image: '/assets/multimedia-lab.jpg',
    rating: 4.8,
    reviews: 35,
  },
  {
    id: 'R005',
    name: 'Group Room B',
    building: 'Science Building',
    floor: 'Ground Floor',
    capacity: 8,
    type: 'Study Room',
    features: ['Whiteboard', 'TV Screen', 'Ergonomic chairs'],
    availableSlots: [],
    description:
      'Collaborative space ideal for group discussions and project work.',
    image: '/assets/group-b.jpg',
    rating: 4.1,
    reviews: 23,
  },
  {
    id: 'R006',
    name: 'Library Quiet Room',
    building: 'Main Library',
    floor: '2nd Floor',
    capacity: 10,
    type: 'Quiet Study',
    features: [
      'Individual carrels',
      'Reading lamps',
      'Power outlets',
      'Sound insulation',
    ],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '09:00', endTime: '12:00' },
      { date: 'May 28, 2025', startTime: '14:00', endTime: '17:00' },
      { date: 'May 29, 2025', startTime: '09:00', endTime: '12:00' },
    ],
    description:
      'Silent study space with individual carrels for focused independent work.',
    image: '/assets/quiet-room.jpg',
    rating: 4.6,
    reviews: 31,
  },
  {
    id: 'R007',
    name: 'Computer Lab 1',
    building: 'Technology Center',
    floor: '1st Floor',
    capacity: 24,
    type: 'Computer Lab',
    features: [
      'High-performance PCs',
      'Specialized software',
      'Interactive projector',
      'Printing facilities',
    ],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '15:00', endTime: '17:00' },
      { date: 'May 29, 2025', startTime: '15:00', endTime: '17:00' },
    ],
    description:
      'Computer lab with high-spec workstations and specialized software for tech projects.',
    image: '/assets/comp-lab-1.jpg',
    rating: 4.4,
    reviews: 45,
  },
  {
    id: 'R008',
    name: 'Seminar Room 201',
    building: 'Humanities Building',
    floor: '2nd Floor',
    capacity: 15,
    type: 'Seminar Room',
    features: [
      'U-shaped seating',
      'Projector',
      'Document camera',
      'Whiteboard wall',
    ],
    availableSlots: [
      { date: 'May 28, 2025', startTime: '10:00', endTime: '12:00' },
      { date: 'May 29, 2025', startTime: '13:00', endTime: '15:00' },
    ],
    description:
      'Ideal for small seminars and discussion groups with U-shaped seating arrangement.',
    image: '/assets/seminar-201.jpg',
    rating: 4.2,
    reviews: 17,
  },
];

// Filter options
const roomTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'study', label: 'Study Rooms' },
  { value: 'conference', label: 'Conference Rooms' },
  { value: 'computer', label: 'Computer Labs' },
  { value: 'seminar', label: 'Seminar Rooms' },
  { value: 'quiet', label: 'Quiet Study' },
  { value: 'multimedia', label: 'Multimedia Labs' },
];

const capacityRanges = [
  { value: 'all', label: 'Any Capacity' },
  { value: 'small', label: '1-4 People' },
  { value: 'medium', label: '5-10 People' },
  { value: 'large', label: '11+ People' },
];

const featureOptions = [
  {
    value: 'whiteboard',
    label: 'Whiteboard',
    icon: <PanelTop className='h-4 w-4' />,
  },
  { value: 'projector', label: 'Projector', icon: <Eye className='h-4 w-4' /> },
  {
    value: 'computer',
    label: 'Computers',
    icon: <Computer className='h-4 w-4' />,
  },
  { value: 'wifi', label: 'WiFi', icon: <Wifi className='h-4 w-4' /> },
];

const RoomsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState<any>(null);

  // Filter rooms based on selections
  const filteredRooms = rooms.filter((room) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by room type
    const matchesType =
      selectedType === 'all' ||
      room.type.toLowerCase().includes(selectedType.toLowerCase());

    // Filter by capacity
    const matchesCapacity =
      selectedCapacity === 'all' ||
      (selectedCapacity === 'small' && room.capacity <= 4) ||
      (selectedCapacity === 'medium' &&
        room.capacity > 4 &&
        room.capacity <= 10) ||
      (selectedCapacity === 'large' && room.capacity > 10);

    // Filter by features
    const matchesFeatures =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((feature) =>
        room.features.some((f) =>
          f.toLowerCase().includes(feature.toLowerCase())
        )
      );

    // Filter by availability on selected date
    const matchesDate =
      !selectedDate ||
      room.availableSlots.some((slot) => slot.date === selectedDate);

    return (
      matchesSearch &&
      matchesType &&
      matchesCapacity &&
      matchesFeatures &&
      matchesDate
    );
  });

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    // Default to first available date if any
    if (room.availableSlots.length > 0) {
      setBookingDate(room.availableSlots[0].date);
    }
  };

  const handleCloseDetail = () => {
    setSelectedRoom(null);
    setBookingSlot(null);
  };

  const handleSelectSlot = (slot: any) => {
    setBookingSlot(slot);
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const getAvailableSlots = () => {
    if (!selectedRoom) return [];
    return selectedRoom.availableSlots.filter(
      (slot: any) => slot.date === bookingDate
    );
  };

  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    if (lowerFeature.includes('whiteboard'))
      return <PanelTop className='h-4 w-4' />;
    if (lowerFeature.includes('projector')) return <Eye className='h-4 w-4' />;
    if (lowerFeature.includes('computer') || lowerFeature.includes('pc'))
      return <Computer className='h-4 w-4' />;
    if (lowerFeature.includes('wifi')) return <Wifi className='h-4 w-4' />;
    return <Clock className='h-4 w-4' />;
  };

  const handleApplyFilters = () => {
    // In a real application, this would trigger API calls
    console.log('Applied filters:', {
      selectedType,
      selectedCapacity,
      selectedFeatures,
      selectedDate,
    });
  };

  return (
    <StudentDashboardLayout>
      <div className='space-y-6'>
        {!selectedRoom ? (
          <>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <h1 className='text-2xl font-semibold'>Room Directory</h1>

              {/* Search and filter controls */}
              <div className='flex flex-wrap gap-2 w-full md:w-auto'>
                <div className='relative flex-1 md:flex-none'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search rooms...'
                    className='pl-9 py-2 pr-4 border rounded-md w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Room type filter */}
                <div className='relative flex-1 md:flex-none'>
                  <select
                    className='appearance-none pl-3 pr-8 py-2 border rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {roomTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Filter className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
                </div>

                {/* Capacity filter */}
                <div className='relative flex-1 md:flex-none'>
                  <select
                    className='appearance-none pl-3 pr-8 py-2 border rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={selectedCapacity}
                    onChange={(e) => setSelectedCapacity(e.target.value)}
                  >
                    {capacityRanges.map((capacity) => (
                      <option key={capacity.value} value={capacity.value}>
                        {capacity.label}
                      </option>
                    ))}
                  </select>
                  <Users className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
                </div>

                {/* Date filter */}
                <div className='relative flex-1 md:flex-none'>
                  <input
                    type='date'
                    className='pl-3 pr-8 py-2 border rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
                </div>

                <Button
                  size='sm'
                  onClick={handleApplyFilters}
                  className='flex-1 md:flex-none'
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Feature filters */}
            <div className='flex flex-wrap gap-2'>
              {featureOptions.map((feature) => (
                <Button
                  key={feature.value}
                  variant={
                    selectedFeatures.includes(feature.value)
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  onClick={() => handleFeatureToggle(feature.value)}
                  className='flex items-center gap-1'
                >
                  {feature.icon}
                  {feature.label}
                </Button>
              ))}
            </div>

            {filteredRooms.length > 0 ? (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className='h-48 bg-gray-100 relative'>
                      {/* In a real app, this would be an actual image */}
                      <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
                        {room.name} Image
                      </div>
                    </div>
                    <CardHeader className='pb-2'>
                      <div className='flex justify-between'>
                        <div>
                          <CardTitle>{room.name}</CardTitle>
                          <CardDescription>
                            {room.building}, {room.floor}
                          </CardDescription>
                        </div>
                        <div className='flex items-center bg-gray-100 px-2 py-1 rounded-md'>
                          <Users className='h-4 w-4 mr-1 text-gray-500' />
                          <span className='text-sm font-medium'>
                            {room.capacity}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='pb-2'>
                      <p className='text-sm line-clamp-2 text-gray-600 mb-2'>
                        {room.description}
                      </p>
                      <div className='flex flex-wrap gap-1 mb-2'>
                        {room.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className='inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs'
                          >
                            {getFeatureIcon(feature)}
                            <span className='ml-1'>{feature}</span>
                          </span>
                        ))}
                        {room.features.length > 3 && (
                          <span className='inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs'>
                            +{room.features.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center'>
                          <span className='text-amber-500'>★</span>
                          <span className='text-sm font-medium ml-1'>
                            {room.rating}
                          </span>
                          <span className='text-xs text-gray-500 ml-1'>
                            ({room.reviews} reviews)
                          </span>
                        </div>
                        <span
                          className={`text-xs py-1 px-2 rounded-full ${
                            room.availableSlots.length > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {room.availableSlots.length > 0
                            ? `${room.availableSlots.length} slots available`
                            : 'No availability'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className='w-full'
                        variant={
                          room.availableSlots.length > 0 ? 'default' : 'outline'
                        }
                        disabled={room.availableSlots.length === 0}
                      >
                        {room.availableSlots.length > 0
                          ? 'Book Now'
                          : 'Unavailable'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='rounded-full bg-gray-100 p-6 mb-4'>
                  <DoorOpen className='h-12 w-12 text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-gray-700'>
                  No rooms match your criteria
                </h3>
                <p className='text-gray-500 mt-2 max-w-sm'>
                  Try adjusting your filters or search query to find available
                  rooms.
                </p>
              </div>
            )}
          </>
        ) : (
          // Room detail view with booking options
          <div className='space-y-6'>
            <Button variant='outline' onClick={handleCloseDetail}>
              ← Back to Room Directory
            </Button>

            <div className='grid gap-6 md:grid-cols-2'>
              <div>
                <div className='h-72 bg-gray-100 rounded-lg relative'>
                  {/* In a real app, this would be an actual image */}
                  <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
                    {selectedRoom.name} Image
                  </div>
                </div>

                <div className='mt-4'>
                  <h1 className='text-2xl font-semibold'>
                    {selectedRoom.name}
                  </h1>
                  <p className='text-gray-500'>
                    {selectedRoom.building}, {selectedRoom.floor}
                  </p>

                  <div className='flex items-center mt-1'>
                    <span className='text-amber-500'>★</span>
                    <span className='text-sm font-medium ml-1'>
                      {selectedRoom.rating}
                    </span>
                    <span className='text-xs text-gray-500 ml-1'>
                      ({selectedRoom.reviews} reviews)
                    </span>
                  </div>

                  <p className='mt-4'>{selectedRoom.description}</p>

                  <div className='mt-6'>
                    <h3 className='font-medium mb-2'>Features & Amenities</h3>
                    <div className='grid grid-cols-2 gap-2'>
                      {selectedRoom.features.map(
                        (feature: string, index: number) => (
                          <div key={index} className='flex items-center'>
                            {getFeatureIcon(feature)}
                            <span className='ml-2 text-sm'>{feature}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Book this Room</CardTitle>
                  <CardDescription>
                    Select a date and time slot to book {selectedRoom.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {selectedRoom.availableSlots.length > 0 ? (
                    <>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Select Date
                        </label>
                        <select
                          className='w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                        >
                          {Array.from(
                            new Set(
                              selectedRoom.availableSlots.map(
                                (slot: any) => slot.date
                              )
                            )
                          ).map((date: any) => (
                            <option key={date} value={date}>
                              {date}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Select Time Slot
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                          {getAvailableSlots().length > 0 ? (
                            getAvailableSlots().map(
                              (slot: any, index: number) => (
                                <div
                                  key={index}
                                  className={`p-2 border rounded-md cursor-pointer ${
                                    bookingSlot === slot
                                      ? 'bg-primary text-white border-primary'
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleSelectSlot(slot)}
                                >
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              )
                            )
                          ) : (
                            <p className='col-span-2 text-sm text-gray-500'>
                              No available slots on this date
                            </p>
                          )}
                        </div>
                      </div>

                      <div className='pt-4 border-t'>
                        <div className='flex justify-between mb-2'>
                          <span>Room type:</span>
                          <span className='font-medium'>
                            {selectedRoom.type}
                          </span>
                        </div>
                        <div className='flex justify-between mb-2'>
                          <span>Capacity:</span>
                          <span className='font-medium'>
                            {selectedRoom.capacity} people
                          </span>
                        </div>
                        {bookingSlot && (
                          <>
                            <div className='flex justify-between mb-2'>
                              <span>Date:</span>
                              <span className='font-medium'>
                                {bookingSlot.date}
                              </span>
                            </div>
                            <div className='flex justify-between mb-2'>
                              <span>Time:</span>
                              <span className='font-medium'>
                                {bookingSlot.startTime} - {bookingSlot.endTime}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className='flex flex-col items-center py-6 text-center'>
                      <div className='rounded-full bg-red-50 p-3 mb-3'>
                        <Clock className='h-6 w-6 text-red-500' />
                      </div>
                      <h3 className='font-medium text-red-800'>
                        No Available Slots
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        This room is currently fully booked. Please check back
                        later or try another room.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className='w-full'
                    disabled={
                      !bookingSlot || selectedRoom.availableSlots.length === 0
                    }
                  >
                    Confirm Booking
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default RoomsPage;
