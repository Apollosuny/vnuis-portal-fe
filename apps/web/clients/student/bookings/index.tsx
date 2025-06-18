'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  roomBookingApi,
  type RoomBookingResponse,
  type RoomBookingResponseWithPagination,
} from '@/api/room-booking.api';
import { toast } from 'sonner';

// Animation and filters remain unchanged
const floatAnimation = {
  '0%, 100%': {
    transform: 'translateY(0)',
  },
  '50%': {
    transform: 'translateY(-10px)',
  },
};

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle className='h-4 w-4 text-green-600' />;
    case 'PENDING':
      return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
    case 'REJECTED':
      return <XCircle className='h-4 w-4 text-red-600' />;
    default:
      return null;
  }
};

const formatDateTime = (dateStr: string) => {
  return DateTime.fromISO(dateStr).toFormat('dd LLL yyyy HH:mm');
};

const BookingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] =
    useState<RoomBookingResponse | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<RoomBookingResponseWithPagination>({
    queryKey: ['bookings', 'my', page, limit],
    queryFn: async () => {
      const response = await roomBookingApi.getMyBookings(page, limit);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => roomBookingApi.cancelBooking(bookingId),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    },
  });

  // Filter bookings based on active tab and filters
  const filteredBookings =
    data?.data.filter((booking: RoomBookingResponse) => {
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

      if (activeTab === 'history') {
        // History tab shows past bookings
        return true;
      }

      if (activeTab !== 'current' && activeTab !== 'history') {
        return true; // For any other tabs we might add later
      }

      return false;
    }) || [];

  // Further filter by status if needed
  const finalFilteredBookings = filteredBookings.filter(
    (booking: RoomBookingResponse) => {
      if (selectedStatus === 'all') return true;
      return booking.status === selectedStatus;
    }
  );

  const getUpcomingBookingsCount = () => {
    return (
      data?.data.filter((booking: RoomBookingResponse) => {
        const bookingDate = DateTime.fromISO(booking.startTime);
        const today = DateTime.now();
        return (
          bookingDate >= today &&
          (booking.status === 'APPROVED' || booking.status === 'PENDING')
        );
      }).length || 0
    );
  };

  const getHistoryBookingsCount = () => {
    return (
      data?.data.filter((booking: RoomBookingResponse) => {
        const bookingDate = DateTime.fromISO(booking.startTime);
        const today = DateTime.now();
        return (
          bookingDate < today ||
          booking.status === 'REJECTED' ||
          booking.status === 'CANCELLED'
        );
      }).length || 0
    );
  };

  const handleBookingClick = (booking: RoomBookingResponse) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetail = () => {
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (
    e: React.MouseEvent,
    bookingId: string
  ) => {
    e.stopPropagation();
    cancelBookingMutation.mutate(bookingId);
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
                {isLoading ? (
                  <div className='text-center py-16'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'></div>
                    <div className='mt-4 text-lg text-gray-600'>
                      Loading your bookings...
                    </div>
                  </div>
                ) : finalFilteredBookings.length > 0 ? (
                  finalFilteredBookings.map((booking) => (
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
                  ))
                ) : (
                  <div className='text-center py-16 px-4'>
                    <div className='max-w-md mx-auto'>
                      {activeTab === 'current' ? (
                        <div className='space-y-6'>
                          <div className='relative inline-block'>
                            <Calendar className='w-16 h-16 text-primary/60 motion-safe:animate-bounce' />
                            <div className='absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium'>
                              0
                            </div>
                          </div>
                          <div>
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                              No Current Bookings
                            </h3>
                            <p className='text-gray-600 mb-6'>
                              {selectedStatus !== 'all'
                                ? `You don't have any ${selectedStatus.toLowerCase()} bookings at the moment.`
                                : `Looks like you haven't booked any rooms yet. 
                                   Start by booking a room for your study sessions or group meetings!`}
                            </p>
                            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                              <Button
                                size='lg'
                                onClick={() =>
                                  (window.location.href = '/student/book-room')
                                }
                                className='flex items-center gap-2'
                              >
                                <Calendar className='w-4 h-4' />
                                Book a Room Now
                              </Button>
                              {selectedStatus !== 'all' && (
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => setSelectedStatus('all')}
                                  className='flex items-center gap-2'
                                >
                                  <Filter className='w-4 h-4' />
                                  Clear Filters
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='space-y-6'>
                          <div className='relative inline-block'>
                            <Clock className='w-16 h-16 text-gray-400 animate-pulse' />
                            {searchQuery || selectedStatus !== 'all' ? (
                              <div className='absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm'>
                                <Filter className='w-4 h-4' />
                              </div>
                            ) : null}
                          </div>
                          <div>
                            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                              No Booking History Found
                            </h3>
                            <p className='text-gray-600 mb-4'>
                              {selectedStatus !== 'all'
                                ? `No ${selectedStatus.toLowerCase()} bookings found in your history.`
                                : searchQuery
                                  ? 'No bookings match your search criteria.'
                                  : 'Your booking history is empty. Past and cancelled bookings will appear here.'}
                            </p>
                            {(searchQuery || selectedStatus !== 'all') && (
                              <Button
                                variant='outline'
                                onClick={() => {
                                  setSearchQuery('');
                                  setSelectedStatus('all');
                                }}
                                className='flex items-center gap-2'
                              >
                                <Filter className='w-4 h-4' />
                                Clear All Filters
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
