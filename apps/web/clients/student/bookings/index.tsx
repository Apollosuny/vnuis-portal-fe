'use client';

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
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
import { useRoomBookings } from '@/hooks/useRoomBookings';
import type { RoomBookingResponse } from '@/api/room-booking.api';

// Filter options
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] =
    useState<RoomBookingResponse | null>(null);
  const {
    loading,
    error,
    bookings,
    pagination,
    fetchMyBookings,
    cancelBooking,
  } = useRoomBookings();

  useEffect(() => {
    // Load initial bookings
    fetchMyBookings(1, 10);
  }, [fetchMyBookings]);

  // Filter bookings based on active tab and filters
  const filteredBookings = bookings
    .filter((booking) => {
      // Filter by active tab
      if (
        activeTab === 'current' &&
        (booking.status === 'APPROVED' || booking.status === 'PENDING')
      ) {
        // Current tab shows upcoming bookings (Approved or Pending)
        const bookingDate = DateTime.fromISO(booking.startTime);
        const today = DateTime.now();
        return bookingDate >= today;
      }

      if (
        activeTab === 'history' &&
        (booking.status === 'REJECTED' || booking.status === 'CANCELLED')
      ) {
        // History tab shows past bookings
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
        booking.room?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.room?.location
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Apply status filter
      const matchesStatus =
        selectedStatus === 'all' || booking.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

  const handleBookingClick = (booking: RoomBookingResponse) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'PENDING':
        return <Clock className='h-4 w-4 text-amber-500' />;
      case 'REJECTED':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'CANCELLED':
        return <XCircle className='h-4 w-4 text-gray-500' />;
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (
    e: React.MouseEvent,
    bookingId: string
  ) => {
    e.stopPropagation();
    await cancelBooking(bookingId);
  };

  const getUpcomingBookingsCount = () => {
    return bookings.filter(
      (booking) =>
        (booking.status === 'APPROVED' || booking.status === 'PENDING') &&
        DateTime.fromISO(booking.startTime) >= DateTime.now()
    ).length;
  };

  const getHistoryBookingsCount = () => {
    return bookings.filter(
      (booking) =>
        booking.status === 'REJECTED' || booking.status === 'CANCELLED'
    ).length;
  };

  const formatDateTime = (isoString: string) => {
    return DateTime.fromISO(isoString).toLocaleString(DateTime.DATETIME_MED);
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

              <div className='grid gap-4'>
                {loading && <div>Loading...</div>}
                {error && <div className='text-red-500'>{error}</div>}
                {!loading &&
                  !error &&
                  filteredBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className='cursor-pointer hover:border-primary transition-colors'
                      onClick={() => handleBookingClick(booking)}
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div>
                            <CardTitle>
                              {booking.room?.name || 'Unknown Room'}
                            </CardTitle>
                            <CardDescription>
                              {booking.room?.location}
                            </CardDescription>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='grid gap-2'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span>{formatDateTime(booking.startTime)}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-gray-500' />
                            <span>
                              {DateTime.fromISO(booking.endTime).toFormat(
                                'HH:mm'
                              )}{' '}
                              ({booking.duration} hours)
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4 text-gray-500' />
                            <span>{booking.room?.location}</span>
                          </div>
                          {booking.attendees && (
                            <div className='flex items-center gap-2'>
                              <Users className='h-4 w-4 text-gray-500' />
                              <span>{booking.attendees} participants</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className='flex justify-between'>
                        <span className='text-sm text-gray-500'>
                          Booked on {formatDateTime(booking.createdAt)}
                        </span>
                        {booking.status === 'PENDING' && (
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={(e) => handleCancelBooking(e, booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </Tabs>
          </>
        ) : (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <Button variant='ghost' onClick={handleCloseDetail}>
                ← Back to bookings
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle>
                      {selectedBooking.room?.name || 'Unknown Room'}
                    </CardTitle>
                    <CardDescription>
                      {selectedBooking.room?.location}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {getStatusIcon(selectedBooking.status)}
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span>{formatDateTime(selectedBooking.startTime)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-gray-500' />
                      <span>
                        {DateTime.fromISO(selectedBooking.endTime).toFormat(
                          'HH:mm'
                        )}{' '}
                        ({selectedBooking.duration} hours)
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-gray-500' />
                      <span>{selectedBooking.room?.location}</span>
                    </div>
                    {selectedBooking.attendees && (
                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-gray-500' />
                        <span>{selectedBooking.attendees} participants</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className='font-medium mb-2'>Purpose</h3>
                    <p className='text-gray-600'>{selectedBooking.purpose}</p>
                  </div>

                  {selectedBooking.remarks && (
                    <div>
                      <h3 className='font-medium mb-2'>Remarks</h3>
                      <p className='text-gray-600'>{selectedBooking.remarks}</p>
                    </div>
                  )}

                  {selectedBooking.handleAt && (
                    <div className='text-sm text-gray-500'>
                      Last updated: {formatDateTime(selectedBooking.handleAt)}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <span className='text-sm text-gray-500'>
                  Booking ID: {selectedBooking.id}
                </span>
                {selectedBooking.status === 'PENDING' && (
                  <Button
                    variant='destructive'
                    onClick={(e) => handleCancelBooking(e, selectedBooking.id)}
                  >
                    Cancel Booking
                  </Button>
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
