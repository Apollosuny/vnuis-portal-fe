'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';
import { roomApi } from '@/api/room.api';
import { roomTimeSlotApi } from '@/api/room-time-slot.api';
import { roomBookingApi } from '@/api/room-booking.api';
import { Room, RoomType } from '@/types/room.types';
import {
  formatDateForDisplay,
  formatISODateForUI,
  formatTimeFromISOString,
  convertTimeZone,
} from '../../../utils/date';

// Filter options
const roomTypes = [
  { value: 'all', label: 'All Types' },
  { value: RoomType.CLASSROOM, label: 'Classrooms' },
  { value: RoomType.LAB, label: 'Labs' },
  { value: RoomType.EVENT, label: 'Event Halls' },
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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Record<string, any[]>
  >({});

  // Fetch all rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const fetchedRooms = await roomApi.getRooms();
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    // Reset booking states
    setBookingError(null);
    setBookingSuccess(false);
    setBookingPurpose('');

    fetchRooms();
  }, []);

  // Filter rooms based on selections
  const filteredRooms = rooms.filter((room) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description &&
        room.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by room type
    const matchesType = selectedType === 'all' || room.type === selectedType;

    // Filter by capacity
    const matchesCapacity =
      selectedCapacity === 'all' ||
      (selectedCapacity === 'small' && room.capacity <= 4) ||
      (selectedCapacity === 'medium' &&
        room.capacity > 4 &&
        room.capacity <= 10) ||
      (selectedCapacity === 'large' && room.capacity > 10);

    // Filter by features - for now we don't have features in the API model
    // This would need to be implemented if backend adds feature support
    const matchesFeatures = selectedFeatures.length === 0;

    // Filter by availability on selected date
    // For now, we consider all rooms potentially available without checking specific dates
    const matchesDate = !selectedDate || room.isAvailable;

    return (
      matchesSearch &&
      matchesType &&
      matchesCapacity &&
      matchesFeatures &&
      matchesDate
    );
  });

  // Function to get available time slots for a specific room and date
  const fetchAvailableSlots = async (roomId: string, date: string) => {
    try {
      const today = new Date();
      const offset = today.getTimezoneOffset().toString();
      const slots = await roomTimeSlotApi.getAvailableTimeSlots(
        roomId,
        date,
        offset
      );
      return slots;
    } catch (error) {
      console.error(
        `Failed to fetch available slots for room ${roomId}:`,
        error
      );
      return [];
    }
  };

  const handleRoomClick = async (room: Room) => {
    setSelectedRoom(room);

    // Set default date to today
    const today = new Date();
    const formattedToday = formatISODateForUI(today);
    setBookingDate(formattedToday);

    // Fetch available slots for this room and today's date
    try {
      const slots = await fetchAvailableSlots(room.roomId, formattedToday);
      setAvailableTimeSlots({
        [formattedToday]: slots,
      });
    } catch (error) {
      console.error('Failed to fetch available time slots:', error);
    }
  };

  const handleDateChange = async (date: string) => {
    setBookingDate(date);
    setBookingSlot(null);

    // If we've already fetched slots for this date, don't fetch again
    if (availableTimeSlots[date]) return;

    // Otherwise fetch slots for the selected date
    if (selectedRoom) {
      try {
        const slots = await fetchAvailableSlots(selectedRoom.roomId, date);
        setAvailableTimeSlots((prev) => ({
          ...prev,
          [date]: slots,
        }));
      } catch (error) {
        console.error('Failed to fetch available time slots:', error);
      }
    }
  };

  const handleCloseDetail = () => {
    setSelectedRoom(null);
    setBookingSlot(null);
    setBookingDate('');
    setAvailableTimeSlots({});
    setBookingSuccess(false);
    setBookingError(null);
    setBookingPurpose('');
  };

  const handleSelectSlot = (slot: any) => {
    setBookingSlot(slot);
    setBookingError(null);
  };

  const handleBookRoom = async () => {
    if (!selectedRoom || !bookingDate || !bookingSlot) {
      setBookingError('Please select a room, date, and time slot first.');
      return;
    }

    if (!bookingPurpose.trim()) {
      setBookingError('Please provide a purpose for your booking.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      // Get the booking slot information
      if (!bookingSlot || !bookingDate) {
        setBookingError('Missing booking information. Please try again.');
        setBookingLoading(false);
        return;
      }

      // Format: YYYY-MM-DD
      const dateStr = bookingDate;

      // Find the time string (format: HH:MM) - prefer localStartTime as it's already converted to local timezone
      const timeStr =
        bookingSlot.localStartTime ||
        bookingSlot.startTime ||
        bookingSlot.startHour ||
        '';

      if (!timeStr) {
        throw new Error('Invalid time slot');
      }

      // Parse the date and time components
      const [yearStr, monthStr, dayStr] = dateStr.split('-');
      const [hoursStr, minutesStr] = timeStr.split(':');

      if (!yearStr || !monthStr || !dayStr || !hoursStr || !minutesStr) {
        throw new Error('Invalid date or time format');
      }

      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hours) ||
        isNaN(minutes)
      ) {
        throw new Error('Invalid date or time values');
      }

      // In JavaScript months are 0-indexed (0 = January, 11 = December)
      const startTime = new Date(year, month - 1, day, hours, minutes);

      // Get user's timezone offset for the API
      const offset = new Date().getTimezoneOffset() * -1; // Convert to positive
      const offsetHours = Math.floor(offset / 60);
      const offsetMinutes = Math.abs(offset % 60);
      const offsetStr = `${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;

      // Make sure we have a valid duration
      const duration = bookingSlot.duration
        ? bookingSlot.duration / 60 // Convert minutes to hours if duration is in minutes
        : 1; // Default to 1 hour if no duration specified

      console.log('startTime', startTime.toISOString());

      // Call the API to book the room
      await roomBookingApi.createBooking({
        startTime: startTime.toISOString(),
        duration,
        purpose: bookingPurpose,
        isRecurring: false,
        roomId: selectedRoom.roomId,
        offset: '0',
      });

      setBookingSuccess(true);
      setBookingError(null);

      // Reset fields after successful booking
      setBookingSlot(null);
      setBookingPurpose('');

      // Refresh available slots to reflect the new booking
      const slots = await fetchAvailableSlots(selectedRoom.roomId, bookingDate);
      setAvailableTimeSlots((prev) => ({
        ...prev,
        [bookingDate]: slots,
      }));
    } catch (error: any) {
      console.error('Failed to book room:', error);
      // Get more specific error message if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to book the room. Please try again.';

      setBookingError(errorMessage);
      setBookingSuccess(false);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const getAvailableSlots = () => {
    if (!selectedRoom || !bookingDate) return [];
    return availableTimeSlots[bookingDate] || [];
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
    // In a real application, this would trigger API calls with filters
    console.log('Applied filters:', {
      selectedType,
      selectedCapacity,
      selectedFeatures,
      selectedDate,
    });
  };

  // Function to determine if a room has available slots
  const hasAvailableSlots = (room: Room) => {
    return room.isAvailable;
  };

  // Generate fake features based on room type (since we don't have features in the API model)
  const getRoomFeatures = (room: Room) => {
    const features = [];

    if (room.type === RoomType.CLASSROOM) {
      features.push('Whiteboard', 'Projector');
    } else if (room.type === RoomType.LAB) {
      features.push('Computer Workstations', 'Specialized Equipment', 'WiFi');
    } else if (room.type === RoomType.EVENT) {
      features.push('Sound System', 'Large Display', 'Adjustable Lighting');
    }

    // Add generic features
    features.push('Power Outlets');
    if (room.capacity > 10) features.push('Air Conditioning');

    return features;
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className='flex flex-col items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin text-primary/70' />
          <p className='mt-4 text-gray-500'>Loading rooms...</p>
        </div>
      </StudentDashboardLayout>
    );
  }

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
                {filteredRooms.map((room) => {
                  const features = getRoomFeatures(room);
                  return (
                    <Card
                      key={room.roomId}
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
                            <CardDescription>{room.location}</CardDescription>
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
                          {room.description || 'No description available.'}
                        </p>
                        <div className='flex flex-wrap gap-1 mb-2'>
                          {features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className='inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs'
                            >
                              {getFeatureIcon(feature)}
                              <span className='ml-1'>{feature}</span>
                            </span>
                          ))}
                          {features.length > 3 && (
                            <span className='inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs'>
                              +{features.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center'>
                            <span className='text-sm font-medium'>
                              {room.type.charAt(0) +
                                room.type.slice(1).toLowerCase()}
                            </span>
                          </div>
                          <span
                            className={`text-xs py-1 px-2 rounded-full ${
                              hasAvailableSlots(room)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {hasAvailableSlots(room)
                              ? 'Available'
                              : 'Not available'}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className='w-full'
                          variant={
                            hasAvailableSlots(room) ? 'default' : 'outline'
                          }
                          disabled={!hasAvailableSlots(room)}
                        >
                          {hasAvailableSlots(room) ? 'Book Now' : 'Unavailable'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
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
                  <p className='text-gray-500'>{selectedRoom.location}</p>

                  <div className='flex items-center mt-1'>
                    <span className='text-sm font-medium'>
                      {selectedRoom.type.charAt(0) +
                        selectedRoom.type.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <p className='mt-4'>
                    {selectedRoom.description || 'No description available.'}
                  </p>

                  <div className='mt-6'>
                    <h3 className='font-medium mb-2'>Features & Amenities</h3>
                    <div className='grid grid-cols-2 gap-2'>
                      {getRoomFeatures(selectedRoom).map((feature, index) => (
                        <div key={index} className='flex items-center'>
                          {getFeatureIcon(feature)}
                          <span className='ml-2 text-sm'>{feature}</span>
                        </div>
                      ))}
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
                  {selectedRoom.isAvailable ? (
                    <>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Select Date
                        </label>
                        <input
                          type='date'
                          className='w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                          value={bookingDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Select Time Slot
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                          {getAvailableSlots().length > 0 ? (
                            getAvailableSlots().map(
                              (slot: any, index: number) => {
                                console.log('Slot:', slot);

                                // Use startHour and endHour from response instead of startTime/endTime
                                const startHourValue =
                                  slot.startHour || slot.startTime || '';
                                const endHourValue =
                                  slot.endHour || slot.endTime || '';

                                // Convert from UTC to local time
                                const startTime = convertTimeZone(
                                  startHourValue,
                                  bookingDate,
                                  false
                                );

                                const endTime = convertTimeZone(
                                  endHourValue,
                                  bookingDate,
                                  false
                                );

                                return (
                                  <div
                                    key={index}
                                    className={`p-2 border rounded-md cursor-pointer ${
                                      bookingSlot === slot
                                        ? 'bg-primary text-white border-primary'
                                        : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() =>
                                      handleSelectSlot({
                                        ...slot,
                                        localStartTime: startTime,
                                        localEndTime: endTime,
                                      })
                                    }
                                  >
                                    {startTime} - {endTime}
                                  </div>
                                );
                              }
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
                            {selectedRoom.type.charAt(0) +
                              selectedRoom.type.slice(1).toLowerCase()}
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
                                {formatDateForDisplay(bookingDate)}
                              </span>
                            </div>
                            <div className='flex justify-between mb-2'>
                              <span>Time:</span>
                              <span className='font-medium'>
                                {bookingSlot.localStartTime ||
                                  bookingSlot.startTime ||
                                  bookingSlot.startHour}{' '}
                                -{' '}
                                {bookingSlot.localEndTime ||
                                  bookingSlot.endTime ||
                                  bookingSlot.endHour}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {bookingSlot && (
                        <div className='mt-4 border-t pt-4'>
                          <label
                            htmlFor='purpose'
                            className='block mb-2 text-sm font-medium'
                          >
                            Purpose of booking:
                          </label>
                          <textarea
                            id='purpose'
                            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
                            value={bookingPurpose}
                            onChange={(e) => setBookingPurpose(e.target.value)}
                            placeholder='Please describe the purpose of your booking'
                            rows={3}
                          />
                        </div>
                      )}

                      {bookingError && (
                        <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm'>
                          {bookingError}
                        </div>
                      )}

                      {bookingSuccess && (
                        <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm'>
                          Room booked successfully!
                        </div>
                      )}
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
                        This room is currently not available for booking.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className='w-full'
                    disabled={
                      !bookingSlot ||
                      !selectedRoom.isAvailable ||
                      bookingLoading
                    }
                    onClick={handleBookRoom}
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Processing...
                      </>
                    ) : selectedRoom.isAvailable ? (
                      bookingSlot ? (
                        'Confirm Booking'
                      ) : (
                        'Select a Time Slot'
                      )
                    ) : (
                      'Room Unavailable'
                    )}
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
