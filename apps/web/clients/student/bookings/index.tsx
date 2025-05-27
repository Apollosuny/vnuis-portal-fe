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
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

// Mock data for bookings
const bookings = [
  {
    id: 'BK-1001',
    roomName: 'Study Room 101',
    roomId: 'R001',
    building: 'Main Library',
    floor: '1st Floor',
    date: 'May 28, 2025',
    startTime: '13:00',
    endTime: '15:00',
    status: 'Confirmed',
    createdAt: 'May 25, 2025',
    participants: 3,
    purpose: 'Group Project Discussion',
    amenities: ['Whiteboard', 'Projector'],
    notes: 'Please bring HDMI adapter for laptop connection.',
  },
  {
    id: 'BK-1002',
    roomName: 'Conference Room A',
    roomId: 'R002',
    building: 'Business School',
    floor: '2nd Floor',
    date: 'June 3, 2025',
    startTime: '10:00',
    endTime: '12:00',
    status: 'Pending',
    createdAt: 'May 26, 2025',
    participants: 6,
    purpose: 'Team Presentation Practice',
    amenities: ['Video conferencing', 'Smart board'],
    notes: '',
  },
  {
    id: 'BK-0982',
    roomName: 'Library Quiet Room',
    roomId: 'R006',
    building: 'Main Library',
    floor: '2nd Floor',
    date: 'May 15, 2025',
    startTime: '09:00',
    endTime: '11:00',
    status: 'Completed',
    createdAt: 'May 12, 2025',
    participants: 1,
    purpose: 'Individual Study',
    amenities: ['Individual carrels', 'Reading lamps'],
    notes: '',
  },
  {
    id: 'BK-0975',
    roomName: 'Study Room 102',
    roomId: 'R003',
    building: 'Main Library',
    floor: '1st Floor',
    date: 'May 10, 2025',
    startTime: '14:00',
    endTime: '16:00',
    status: 'Cancelled',
    createdAt: 'May 5, 2025',
    cancelledAt: 'May 8, 2025',
    participants: 4,
    purpose: 'Group Assignment',
    amenities: ['Whiteboard', 'PC workstations'],
    notes: '',
    cancellationReason: 'Changed plans',
  },
  {
    id: 'BK-0968',
    roomName: 'Group Room B',
    roomId: 'R005',
    building: 'Science Building',
    floor: 'Ground Floor',
    date: 'May 5, 2025',
    startTime: '13:00',
    endTime: '15:00',
    status: 'Completed',
    createdAt: 'May 1, 2025',
    participants: 6,
    purpose: 'Study Group for Finals',
    amenities: ['Whiteboard', 'TV Screen'],
    notes: '',
  },
];

// Filter options
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Filter bookings based on active tab and filters
  const filteredBookings = bookings
    .filter((booking) => {
      // Filter by active tab
      if (
        activeTab === 'current' &&
        (booking.status === 'Confirmed' || booking.status === 'Pending')
      ) {
        // Current tab shows upcoming bookings (Confirmed or Pending)
        const today = new Date();
        const bookingDate = new Date(booking.date);
        return bookingDate >= today;
      }

      if (
        activeTab === 'history' &&
        (booking.status === 'Completed' || booking.status === 'Cancelled')
      ) {
        // History tab shows past bookings (Completed or Cancelled)
        return true;
      }

      if (activeTab !== 'current' && activeTab !== 'history') {
        return true; // For any other tabs we might add later
      }

      return false;
    })
    .filter((booking) => {
      // Apply search filter
      const matchesSearch =
        !searchQuery ||
        booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.building.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply status filter
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'upcoming' &&
          (booking.status === 'Confirmed' || booking.status === 'Pending')) ||
        booking.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'Pending':
        return <Clock className='h-4 w-4 text-amber-500' />;
      case 'Completed':
        return <CheckCircle className='h-4 w-4 text-blue-500' />;
      case 'Cancelled':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    // In real app, this would open a confirmation modal
    console.log('Cancelling booking:', bookingId);
  };

  const getUpcomingBookingsCount = () => {
    return bookings.filter(
      (booking) =>
        (booking.status === 'Confirmed' || booking.status === 'Pending') &&
        new Date(booking.date) >= new Date()
    ).length;
  };

  const getHistoryBookingsCount = () => {
    return bookings.filter(
      (booking) =>
        booking.status === 'Completed' || booking.status === 'Cancelled'
    ).length;
  };

  return (
    <StudentDashboardLayout>
      <div className='space-y-6'>
        {!selectedBooking ? (
          <>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <h1 className='text-2xl font-semibold'>My Bookings</h1>

              {/* Search and filter controls */}
              <div className='flex flex-wrap gap-2 w-full md:w-auto'>
                <div className='relative flex-1 md:flex-none'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search bookings...'
                    className='pl-9 py-2 pr-4 border rounded-md w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className='relative flex-1 md:flex-none'>
                  <select
                    className='appearance-none pl-3 pr-8 py-2 border rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statusFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                  <Filter className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
                </div>

                <Button size='sm' className='flex-1 md:flex-none'>
                  Apply
                </Button>
              </div>
            </div>

            <Tabs
              defaultValue='current'
              value={activeTab}
              onValueChange={setActiveTab}
              className='space-y-4'
            >
              <TabsList className='grid w-[400px] grid-cols-2'>
                <TabsTrigger value='current'>
                  Current Bookings
                  <span className='ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-white rounded-full'>
                    {getUpcomingBookingsCount()}
                  </span>
                </TabsTrigger>
                <TabsTrigger value='history'>
                  Booking History
                  <span className='ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-gray-200 text-gray-800 rounded-full'>
                    {getHistoryBookingsCount()}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='current' className='space-y-4'>
                {filteredBookings.length > 0 ? (
                  <div className='space-y-4'>
                    {filteredBookings.map((booking) => (
                      <Card
                        key={booking.id}
                        className='hover:shadow-md transition-shadow cursor-pointer'
                        onClick={() => handleBookingClick(booking)}
                      >
                        <CardHeader className='pb-2'>
                          <div className='flex justify-between items-center'>
                            <div>
                              <CardTitle>{booking.roomName}</CardTitle>
                              <CardDescription>
                                Booking #{booking.id}
                              </CardDescription>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}
                              >
                                {getStatusIcon(booking.status)}
                                {booking.status}
                              </span>
                              {booking.status !== 'Cancelled' &&
                                booking.status !== 'Completed' && (
                                  <button
                                    onClick={(e) =>
                                      handleCancelBooking(e, booking.id)
                                    }
                                    className='text-xs bg-red-50 text-red-800 px-2 py-1 rounded hover:bg-red-100'
                                  >
                                    Cancel
                                  </button>
                                )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className='pb-2'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <Calendar className='h-3 w-3' /> Date
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.date}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <Clock className='h-3 w-3' /> Time
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <MapPin className='h-3 w-3' /> Location
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.building}, {booking.floor}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <Users className='h-3 w-3' /> Participants
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.participants} people
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className='pt-1'>
                          <p className='text-sm text-gray-500'>
                            {booking.purpose}
                          </p>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <div className='rounded-full bg-gray-100 p-6 mb-4'>
                      <Calendar className='h-12 w-12 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700'>
                      No current bookings
                    </h3>
                    <p className='text-gray-500 mt-2 max-w-sm'>
                      You don't have any upcoming room bookings. Head to the
                      Room Directory to book a room.
                    </p>
                    <Button className='mt-4'>Book a Room</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='history' className='space-y-4'>
                {filteredBookings.length > 0 ? (
                  <div className='space-y-4'>
                    {filteredBookings.map((booking) => (
                      <Card
                        key={booking.id}
                        className='hover:shadow-md transition-shadow cursor-pointer'
                        onClick={() => handleBookingClick(booking)}
                      >
                        <CardHeader className='pb-2'>
                          <div className='flex justify-between items-center'>
                            <div>
                              <CardTitle>{booking.roomName}</CardTitle>
                              <CardDescription>
                                Booking #{booking.id}
                              </CardDescription>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}
                            >
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className='pb-2'>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <Calendar className='h-3 w-3' /> Date
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.date}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <Clock className='h-3 w-3' /> Time
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <MapPin className='h-3 w-3' /> Location
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.building}, {booking.floor}
                              </span>
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-500 flex items-center gap-1'>
                                <Users className='h-3 w-3' /> Participants
                              </span>
                              <span className='text-sm font-medium'>
                                {booking.participants} people
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className='pt-1'>
                          <p className='text-sm text-gray-500'>
                            {booking.purpose}
                          </p>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <div className='rounded-full bg-gray-100 p-6 mb-4'>
                      <Clock className='h-12 w-12 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700'>
                      No booking history
                    </h3>
                    <p className='text-gray-500 mt-2 max-w-sm'>
                      You don't have any previous bookings.
                    </p>
                    <Button className='mt-4'>Book a Room</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // Booking detail view
          <div className='space-y-6'>
            <Button variant='outline' onClick={handleCloseDetail}>
              ← Back to Bookings
            </Button>

            <Card>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle className='text-xl'>
                      {selectedBooking.roomName}
                    </CardTitle>
                    <CardDescription>
                      Booking #{selectedBooking.id}
                    </CardDescription>
                  </div>
                  <div className='flex flex-col items-end'>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedBooking.status)}`}
                    >
                      {getStatusIcon(selectedBooking.status)}
                      {selectedBooking.status}
                    </span>
                    <span className='text-xs text-gray-500 mt-1'>
                      Created on {selectedBooking.createdAt}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <Card className='shadow-sm'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm uppercase text-gray-600'>
                        When
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center gap-2 mb-2'>
                        <Calendar className='h-5 w-5 text-primary' />
                        <span className='font-medium'>
                          {selectedBooking.date}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-5 w-5 text-primary' />
                        <span className='font-medium'>
                          {selectedBooking.startTime} -{' '}
                          {selectedBooking.endTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='shadow-sm'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm uppercase text-gray-600'>
                        Where
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center gap-2 mb-2'>
                        <MapPin className='h-5 w-5 text-primary' />
                        <span className='font-medium'>
                          {selectedBooking.roomName}
                        </span>
                      </div>
                      <div className='text-sm text-gray-500 pl-7'>
                        {selectedBooking.building}, {selectedBooking.floor}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className='shadow-sm'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm uppercase text-gray-600'>
                        Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center gap-2 mb-2'>
                        <Users className='h-5 w-5 text-primary' />
                        <span className='font-medium'>
                          {selectedBooking.participants} participants
                        </span>
                      </div>
                      <div className='text-sm text-gray-500 pl-7'>
                        {selectedBooking.purpose}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedBooking.amenities.length > 0 && (
                  <div>
                    <h3 className='font-medium mb-2'>Room Amenities</h3>
                    <div className='flex flex-wrap gap-2'>
                      {selectedBooking.amenities.map(
                        (amenity: string, index: number) => (
                          <span
                            key={index}
                            className='inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs'
                          >
                            {amenity}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div>
                    <h3 className='font-medium mb-2'>Notes</h3>
                    <p className='text-sm text-gray-700 bg-gray-50 p-3 rounded-md'>
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {selectedBooking.status === 'Cancelled' &&
                  selectedBooking.cancellationReason && (
                    <div className='bg-red-50 p-4 rounded-md'>
                      <h3 className='text-sm font-medium text-red-800 mb-2'>
                        Cancelled Booking
                      </h3>
                      <p className='text-sm text-red-700'>
                        <span className='font-medium'>Reason:</span>{' '}
                        {selectedBooking.cancellationReason}
                      </p>
                      <p className='text-sm text-red-700 mt-1'>
                        <span className='font-medium'>Cancelled on:</span>{' '}
                        {selectedBooking.cancelledAt}
                      </p>
                    </div>
                  )}

                {selectedBooking.status === 'Confirmed' && (
                  <div className='bg-green-50 p-4 rounded-md'>
                    <h3 className='text-sm font-medium text-green-800 mb-2'>
                      Confirmed Booking
                    </h3>
                    <p className='text-sm text-green-700'>
                      Your booking is confirmed. Please arrive on time and
                      follow the room usage guidelines.
                    </p>
                  </div>
                )}

                {selectedBooking.status === 'Pending' && (
                  <div className='bg-amber-50 p-4 rounded-md'>
                    <h3 className='text-sm font-medium text-amber-800 mb-2'>
                      Pending Confirmation
                    </h3>
                    <p className='text-sm text-amber-700'>
                      Your booking is pending confirmation. You will receive a
                      notification once it's confirmed.
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className='flex justify-end'>
                {(selectedBooking.status === 'Confirmed' ||
                  selectedBooking.status === 'Pending') && (
                  <Button variant='destructive'>Cancel Booking</Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default BookingsPage;
