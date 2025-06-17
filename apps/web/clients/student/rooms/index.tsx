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
  convertBetweenTimezones,
} from '../../../utils/date';
import { DateTime } from 'luxon';

// Define helper for animation delays (since Tailwind doesn't support dynamic delays by default)
const getDelayStyle = (delayMs: number) => ({
  animationDelay: `${delayMs}ms`,
  transitionDelay: `${delayMs}ms`,
});

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
  const [bookingDuration, setBookingDuration] = useState<number>(1); // Add state for booking duration
  const [isDurationValid, setIsDurationValid] = useState<boolean>(true); // Add state to track duration validity
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
    setBookingDuration(1); // Reset booking duration
    setIsDurationValid(true);

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
      // Get current timezone offset in minutes and convert to hours:minutes format
      // Offset is in minutes, negative for west of UTC and positive for east of UTC
      const now = DateTime.now();
      const offset = '0';

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
    setBookingDuration(1); // Reset duration to default value
    setIsDurationValid(true); // Reset duration validity

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
    setBookingDuration(1); // Reset duration when closing the detail
    setIsDurationValid(true); // Reset duration validity
  };

  const handleSelectSlot = (slot: any) => {
    // Handle selecting a new slot with a smooth animation effect
    console.log('Selected slot:', slot);

    // Use new utility to ensure time is properly converted
    const localStartTime =
      slot.localStartTime ||
      convertBetweenTimezones(
        slot.startHour || slot.startTime || '',
        bookingDate
      );

    const localEndTime =
      slot.localEndTime ||
      convertBetweenTimezones(slot.endHour || slot.endTime || '', bookingDate);

    // Enhance slot with properly calculated local times
    const enhancedSlot = {
      ...slot,
      localStartTime,
      localEndTime,
    };

    console.log('Enhanced slot with proper local times:', enhancedSlot);

    if (
      bookingSlot &&
      bookingSlot.startHour === slot.startHour &&
      bookingSlot.endHour === slot.endHour
    ) {
      // Keep the current selection - no toggle
      setBookingSlot(enhancedSlot);
    } else {
      // Set a new slot with a subtle animation
      setBookingSlot(null);

      // Small delay for visual feedback when changing selection
      setTimeout(() => {
        setBookingSlot(enhancedSlot);
      }, 50);
    }

    setBookingError(null);

    // Validate current duration with the newly selected slot
    if (bookingDuration > 0) {
      const isValid = validateDuration(enhancedSlot, bookingDuration);
      setIsDurationValid(isValid);
      if (!isValid) {
        setBookingError(
          `The selected duration (${bookingDuration} hours) exceeds the available time slot.`
        );
      }
    }
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

    if (bookingDuration <= 0) {
      setBookingError('Please specify a valid duration greater than 0.');
      return;
    }

    // Validate the duration against the selected time slot
    if (!validateDuration(bookingSlot, bookingDuration)) {
      setBookingError(
        `The selected duration (${bookingDuration} hours) exceeds the available time slot.`
      );
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

      // Find the time string (format: HH:MM)
      // For booking, we need to be careful about which time we use
      console.log('Full booking slot data:', bookingSlot);

      // For booking, we should use the UTC time from the server (startHour)
      // because we'll be converting it back to UTC properly
      const originalTimeStr = bookingSlot.startHour || '';
      // This is the local time that was displayed to user
      const localTimeStr = bookingSlot.localStartTime || '';

      if (!originalTimeStr) {
        throw new Error('Invalid time slot - missing original UTC time');
      }

      console.log(`Booking details:
        Date: ${dateStr}
        Original UTC time from server: ${originalTimeStr}
        Local time displayed to user: ${localTimeStr}
      `);

      // Use Luxon to handle date/time and timezone conversion properly
      // We're going to use the original UTC time from server, and create a proper
      // DateTime object with the correct timezone
      const [hours, minutes] = originalTimeStr.split(':').map(Number);

      // Create a DateTime object in UTC first since that's what the server gave us
      // Then we'll ensure it's properly formatted for the API
      // Use DateTime.fromISO to parse the date safely, then set the time components
      // This is a more reliable approach
      const baseDate = DateTime.fromISO(dateStr);

      if (!baseDate.isValid) {
        console.error(
          'Invalid date format:',
          dateStr,
          baseDate.invalidExplanation
        );
        throw new Error('Invalid date format');
      }

      // Create a new DateTime with the specified time components in UTC
      const dateTime = baseDate
        .set({
          hour: hours,
          minute: minutes,
        })
        .setZone('UTC');

      if (!dateTime.isValid) {
        console.error('Invalid DateTime:', dateTime.invalidExplanation);
        throw new Error('Invalid date or time values');
      }

      // Log detailed debug info about the DateTime object
      console.log('DateTime object for booking:', {
        originalUTC: dateTime.toString(),
        iso: dateTime.toISO(),
        toLocal: dateTime.toLocal().toString(),
        toLocalISO: dateTime.toLocal().toISO(),
        offset: dateTime.offset,
      });

      // Get the ISO string for the API - should be in UTC
      const startTimeISO = dateTime.toISO();

      // Get properly formatted timezone offset for API
      const offsetMinutes = DateTime.local().offset;

      // Format offset as +/-HH:MM
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absOffset = Math.abs(offsetMinutes);
      const offsetHours = Math.floor(absOffset / 60);
      const offsetMins = absOffset % 60;
      const formattedOffset = `${sign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

      // Call the API to book the room
      await roomBookingApi.createBooking({
        startTime: startTimeISO,
        duration: bookingDuration, // Use the user-specified duration
        purpose: bookingPurpose,
        isRecurring: false,
        roomId: selectedRoom.roomId,
        offset: '0', // Use the properly formatted timezone offset
      });

      setBookingSuccess(true);
      setBookingError(null);

      // Reset fields after successful booking
      setBookingSlot(null);
      setBookingPurpose('');
      setBookingDuration(1); // Reset duration to default
      setIsDurationValid(true); // Reset duration validity

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

  // Enhanced function to get available slots with proper time conversion
  const getAvailableSlots = () => {
    if (!selectedRoom || !bookingDate) return [];

    const slots = availableTimeSlots[bookingDate] || [];

    return slots;
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

  // Function to check if the selected duration is valid for the time slot
  const validateDuration = (slot: any, duration: number): boolean => {
    if (!slot || !duration) return false;

    // Get the start and end times
    const startTime =
      slot.localStartTime || slot.startTime || slot.startHour || '';
    const endTime = slot.localEndTime || slot.endTime || slot.endHour || '';

    if (!startTime || !endTime) return false;

    // Parse hours and minutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Calculate the slot duration in hours
    const slotDurationHours =
      endHour - startHour + (endMinute - startMinute) / 60;

    // Check if requested duration fits within the slot
    return duration <= slotDurationHours;
  };

  const handleDurationChange = (value: number) => {
    setBookingDuration(value);
    setBookingError(null);

    // Validate duration if a slot is selected
    if (bookingSlot && value > 0) {
      const isValid = validateDuration(bookingSlot, value);
      setIsDurationValid(isValid);
      if (!isValid) {
        setBookingError(
          `The selected duration (${value} hours) exceeds the available time slot.`
        );
      }
    } else {
      setIsDurationValid(true);
    }
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
                        <div className='grid grid-cols-2 gap-3'>
                          {getAvailableSlots().length > 0 ? (
                            getAvailableSlots().map(
                              (slot: any, index: number) => {
                                // Use startHour and endHour from response instead of startTime/endTime
                                const startHourValue =
                                  slot.startHour || slot.startTime || '';
                                const endHourValue =
                                  slot.endHour || slot.endTime || '';

                                console.log(
                                  `Raw slot time: ${startHourValue} - ${endHourValue}`
                                );

                                // Convert from UTC to local time using Luxon
                                let startTime, endTime;

                                try {
                                  console.log(
                                    `Processing time slot: ${startHourValue} - ${endHourValue}`
                                  );

                                  // Parse using Luxon directly for better timezone handling
                                  if (startHourValue && endHourValue) {
                                    const startParts =
                                      startHourValue.split(':');
                                    const endParts = endHourValue.split(':');

                                    if (
                                      startParts.length >= 2 &&
                                      endParts.length >= 2
                                    ) {
                                      const dateObj =
                                        DateTime.fromISO(bookingDate);
                                      console.log(
                                        'Date object for conversion:',
                                        dateObj.toString()
                                      );

                                      // These times are already in UTC from the backend
                                      // We need to interpret them as UTC times and convert to local
                                      const startHour = parseInt(
                                        startParts[0],
                                        10
                                      );
                                      const startMinute = parseInt(
                                        startParts[1],
                                        10
                                      );
                                      const endHour = parseInt(endParts[0], 10);
                                      const endMinute = parseInt(
                                        endParts[1],
                                        10
                                      );

                                      console.log(
                                        `Parsed time values - Start: ${startHour}:${startMinute}, End: ${endHour}:${endMinute}`
                                      );

                                      // Create UTC time and convert to local
                                      const startInUTC = DateTime.fromObject({
                                        year: dateObj.year,
                                        month: dateObj.month,
                                        day: dateObj.day,
                                        hour: startHour,
                                        minute: startMinute,
                                      }).toLocal();

                                      const endInUTC = DateTime.fromObject({
                                        year: dateObj.year,
                                        month: dateObj.month,
                                        day: dateObj.day,
                                        hour: endHour,
                                        minute: endMinute,
                                      }).toLocal();

                                      console.log(
                                        'UTC start time:',
                                        startInUTC.setZone('UTC').toString()
                                      );
                                      console.log(
                                        'Local start time:',
                                        startInUTC.toString()
                                      );
                                      console.log(
                                        'UTC end time:',
                                        endInUTC.setZone('UTC').toString()
                                      );
                                      console.log(
                                        'Local end time:',
                                        endInUTC.toString()
                                      );

                                      startTime = startInUTC.toFormat('HH:mm');
                                      endTime = endInUTC.toFormat('HH:mm');

                                      console.log(
                                        `Final display time: ${startTime} - ${endTime} (local time)`
                                      );
                                    } else {
                                      throw new Error('Invalid time format');
                                    }
                                  } else {
                                    throw new Error('Missing time values');
                                  }
                                } catch (error) {
                                  console.error(
                                    'Error converting time:',
                                    error
                                  );
                                  // Fallback to old method as backup
                                  startTime = convertTimeZone(
                                    startHourValue,
                                    bookingDate,
                                    false
                                  );
                                  endTime = convertTimeZone(
                                    endHourValue,
                                    bookingDate,
                                    false
                                  );
                                  console.log(
                                    `Fallback conversion: ${startTime} - ${endTime}`
                                  );
                                }

                                const isSelected =
                                  bookingSlot &&
                                  bookingSlot.startHour === slot.startHour &&
                                  bookingSlot.endHour === slot.endHour;

                                return (
                                  <div
                                    key={index}
                                    className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-primary via-primary to-primary/90 border-primary shadow-lg scale-105'
                                        : 'bg-white border-gray-200 hover:border-primary/40 hover:shadow-sm hover:scale-[1.02]'
                                    }`}
                                    onClick={() =>
                                      handleSelectSlot({
                                        ...slot,
                                        localStartTime: startTime,
                                        localEndTime: endTime,
                                      })
                                    }
                                  >
                                    {/* Selected indicator */}
                                    {isSelected && (
                                      <div className='absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shadow-md border border-white'>
                                        <span className='text-white text-xs'>
                                          ✓
                                        </span>
                                      </div>
                                    )}

                                    <div className='flex flex-col items-center'>
                                      {/* Time display */}
                                      <div className='flex items-center justify-center mb-1'>
                                        <Clock
                                          className={`h-5 w-5 ${
                                            isSelected
                                              ? 'text-white mr-2'
                                              : 'text-primary mr-2 group-hover:text-primary/80'
                                          }`}
                                        />
                                        <span
                                          className={`text-base font-medium ${
                                            isSelected
                                              ? 'text-white'
                                              : 'group-hover:text-gray-900'
                                          }`}
                                        >
                                          {startTime} - {endTime}
                                        </span>
                                      </div>

                                      {/* Status indicator: available or selected */}
                                      <div
                                        className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                                          isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-green-100 text-green-700'
                                        }`}
                                      >
                                        {isSelected ? 'Selected' : 'Available'}
                                      </div>
                                    </div>
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

                      <div className='mt-6 pt-5 border-t'>
                        <h3 className='font-semibold text-gray-800 mb-3 flex items-center'>
                          <DoorOpen className='mr-2 h-4 w-4 text-primary animate-pulse' />
                          Room Details
                        </h3>

                        {/* Room details card with animation */}
                        <div
                          className={`bg-gray-50 p-4 rounded-lg mb-4 transition-all duration-500 ${
                            bookingSlot
                              ? 'opacity-100 transform translate-y-0 shadow-md'
                              : 'opacity-0 transform -translate-y-4'
                          }`}
                          style={
                            bookingSlot ? { transitionDelay: '100ms' } : {}
                          }
                        >
                          <div className='grid grid-cols-2 gap-y-2 gap-x-4 text-sm'>
                            <div className='text-gray-600'>Room type:</div>
                            <div className='font-medium text-gray-900'>
                              {selectedRoom.type.charAt(0) +
                                selectedRoom.type.slice(1).toLowerCase()}
                            </div>

                            <div className='text-gray-600'>Capacity:</div>
                            <div className='font-medium text-gray-900'>
                              <Users className='inline h-3.5 w-3.5 mr-1 text-gray-500' />
                              {selectedRoom.capacity} people
                            </div>

                            {bookingSlot && (
                              <>
                                <div
                                  className='text-gray-600 transition-all duration-300 opacity-0 animate-pulse'
                                  style={getDelayStyle(100)}
                                >
                                  Date:
                                </div>
                                <div
                                  className='font-medium text-gray-900 transition-all duration-300 opacity-0 animate-pulse'
                                  style={getDelayStyle(200)}
                                >
                                  <Calendar className='inline h-3.5 w-3.5 mr-1 text-gray-500' />
                                  {formatDateForDisplay(bookingDate)}
                                </div>

                                <div
                                  className='text-gray-600 transition-all duration-300 opacity-0 animate-pulse'
                                  style={getDelayStyle(300)}
                                >
                                  Time:
                                </div>
                                <div
                                  className='font-medium text-gray-900 transition-all duration-300 opacity-0 animate-pulse'
                                  style={getDelayStyle(400)}
                                >
                                  <Clock className='inline h-3.5 w-3.5 mr-1 text-gray-500' />
                                  {bookingSlot.localStartTime ||
                                    bookingSlot.startTime ||
                                    bookingSlot.startHour}{' '}
                                  -{' '}
                                  {bookingSlot.localEndTime ||
                                    bookingSlot.endTime ||
                                    bookingSlot.endHour}
                                </div>

                                <div
                                  className='text-gray-600 transition-all duration-300 opacity-0 animate-pulse'
                                  style={getDelayStyle(500)}
                                >
                                  Duration:
                                </div>
                                <div
                                  className='font-medium text-gray-900 transition-all duration-300 opacity-0 animate-pulse'
                                  style={getDelayStyle(600)}
                                >
                                  {bookingDuration}{' '}
                                  {bookingDuration === 1 ? 'hour' : 'hours'}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {bookingSlot && (
                        <>
                          <div
                            className={`mt-4 border-t pt-4 transition-all duration-700 transform ${
                              bookingSlot
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                            }`}
                            style={
                              bookingSlot ? { transitionDelay: '700ms' } : {}
                            }
                          >
                            <label
                              htmlFor='duration'
                              className='flex items-center mb-2 text-sm font-medium group'
                            >
                              <Clock className='mr-2 h-4 w-4 text-primary group-hover:text-primary/80 transition-colors' />
                              Duration (hours):
                            </label>
                            <input
                              id='duration'
                              type='number'
                              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all hover:border-primary/50'
                              min='0.5'
                              max='24'
                              step='0.5'
                              value={bookingDuration}
                              onChange={(e) =>
                                handleDurationChange(parseFloat(e.target.value))
                              }
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                              The duration must fit within the selected time
                              slot (
                              {bookingSlot.localStartTime ||
                                bookingSlot.startTime}{' '}
                              -{' '}
                              {bookingSlot.localEndTime || bookingSlot.endTime})
                            </p>
                          </div>

                          <div
                            className={`mt-4 border-t pt-4 transition-all duration-700 transform ${
                              bookingSlot
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                            }`}
                            style={
                              bookingSlot ? { transitionDelay: '900ms' } : {}
                            }
                          >
                            <label
                              htmlFor='purpose'
                              className='flex items-center mb-2 text-sm font-medium group'
                            >
                              <PanelTop className='mr-2 h-4 w-4 text-primary group-hover:text-primary/80 transition-colors' />
                              Purpose of booking:
                            </label>
                            <textarea
                              id='purpose'
                              className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all hover:border-primary/50'
                              value={bookingPurpose}
                              onChange={(e) =>
                                setBookingPurpose(e.target.value)
                              }
                              placeholder='Please describe the purpose of your booking'
                              rows={3}
                            />
                          </div>
                        </>
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
                    className={`w-full transition-all duration-700 transform ${
                      bookingSlot
                        ? 'opacity-100 scale-100'
                        : 'opacity-70 scale-95'
                    }`}
                    style={bookingSlot ? { transitionDelay: '1100ms' } : {}}
                    disabled={
                      !bookingSlot ||
                      bookingLoading ||
                      !selectedRoom ||
                      (bookingSlot &&
                        bookingDuration > 0 &&
                        !validateDuration(bookingSlot, bookingDuration))
                    }
                    onClick={handleBookRoom}
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Processing...
                      </>
                    ) : !selectedRoom ? (
                      'Room Unavailable'
                    ) : bookingSlot ? (
                      'Confirm Booking'
                    ) : (
                      'Select a Time Slot'
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
