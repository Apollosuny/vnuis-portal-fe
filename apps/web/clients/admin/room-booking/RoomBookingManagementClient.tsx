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
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import type { RoomBookingResponse } from '@/api/room-booking.api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Textarea } from '@workspace/ui/components/textarea';

const statusFilters = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const RoomBookingManagementClient = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBooking, setSelectedBooking] =
    useState<RoomBookingResponse | null>(null);
  const [handleDialogOpen, setHandleDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [dateRange, setDateRange] = useState({
    startDate: DateTime.now().toISODate() || '',
    endDate: DateTime.now().plus({ days: 7 }).toISODate() || '',
  });

  const { loading, error, bookings, pagination, fetchBookings, handleBooking } =
    useAdminBookings();

  useEffect(() => {
    fetchBookings({
      page: 1,
      limit: 10,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      search: searchQuery || undefined,
    });
  }, [
    fetchBookings,
    dateRange.startDate,
    dateRange.endDate,
    selectedStatus,
    searchQuery,
  ]);

  const handleOpenActionDialog = (
    booking: RoomBookingResponse,
    actionType: 'APPROVED' | 'REJECTED'
  ) => {
    setSelectedBooking(booking);
    setAction(actionType);
    setRemarks('');
    setHandleDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking) return;

    await handleBooking(selectedBooking.id, {
      status: action,
      remarks: remarks.trim() || undefined,
    });

    setHandleDialogOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: <CheckCircle className='h-4 w-4' />,
          className: 'bg-green-100 text-green-800',
        };
      case 'PENDING':
        return {
          icon: <Clock className='h-4 w-4' />,
          className: 'bg-yellow-100 text-yellow-800',
        };
      case 'REJECTED':
        return {
          icon: <AlertTriangle className='h-4 w-4' />,
          className: 'bg-red-100 text-red-800',
        };
      case 'CANCELLED':
        return {
          icon: <XCircle className='h-4 w-4' />,
          className: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          icon: <AlertTriangle className='h-4 w-4' />,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const formatDateTime = (isoString: string) => {
    return DateTime.fromISO(isoString).toLocaleString(DateTime.DATETIME_MED);
  };

  return (
    <div className='p-4 md:p-6'>
      {/* Mobile Title */}
      <div className='sm:hidden mb-6'>
        <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
          Room Bookings
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
          Manage and approve room booking requests
        </p>
      </div>

      {/* Desktop Title */}
      <div className='hidden sm:block mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
          Room Bookings
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-2'>
          Manage and approve room booking requests from users
        </p>
      </div>

      {/* Filters */}
      <div className='mb-6 space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div>
            <Label className='text-sm font-medium'>Start Date</Label>
            <Input
              type='date'
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-sm font-medium'>End Date</Label>
            <Input
              type='date'
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-sm font-medium'>Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-sm font-medium'>Search</Label>
            <div className='relative mt-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500' />
              <Input
                type='text'
                placeholder='Search bookings...'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className='space-y-4'>
        {loading ? (
          <div className='text-center py-16'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'></div>
            <div className='mt-4 text-lg text-gray-600'>
              Loading bookings...
            </div>
          </div>
        ) : error ? (
          <div className='text-center py-16'>
            <AlertTriangle className='mx-auto h-12 w-12 text-red-500' />
            <div className='mt-4 text-lg font-semibold text-red-500'>
              Error Loading Bookings
            </div>
            <div className='mt-2 text-gray-600'>{error}</div>
          </div>
        ) : !bookings.length ? (
          <div className='text-center py-16 px-4'>
            <Calendar className='mx-auto h-12 w-12 text-gray-400' />
            <div className='mt-4 text-lg font-semibold text-gray-900'>
              No Bookings Found
            </div>
            <div className='mt-2 text-gray-600 max-w-sm mx-auto'>
              {selectedStatus !== 'ALL'
                ? `No bookings with status "${selectedStatus}" found in the selected date range.`
                : 'No room bookings found for the selected date range. Try adjusting your filters or selecting a different date range.'}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className='border border-gray-200 dark:border-gray-700'
              >
                <CardHeader className='pb-3'>
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate'>
                        {booking.room?.name || 'Unknown Room'}
                      </CardTitle>
                      <CardDescription className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        {booking.room?.location}
                      </CardDescription>
                    </div>
                    <div className='flex items-center justify-start sm:justify-end'>
                      {/* Status Badge */}
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          getStatusBadgeProps(booking.status).className
                        }`}
                      >
                        {getStatusBadgeProps(booking.status).icon}
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='space-y-3'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                        <Calendar className='h-4 w-4 text-gray-500 flex-shrink-0' />
                        <span className='break-words'>
                          {formatDateTime(booking.startTime)}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                        <Clock className='h-4 w-4 text-gray-500 flex-shrink-0' />
                        <span className='break-words'>
                          {DateTime.fromISO(booking.endTime).toFormat('HH:mm')}{' '}
                          ({booking.duration} hours)
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                        <MapPin className='h-4 w-4 text-gray-500 flex-shrink-0' />
                        <span className='break-words'>
                          {booking.room?.location}
                        </span>
                      </div>
                      {booking.attendees && (
                        <div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                          <Users className='h-4 w-4 text-gray-500 flex-shrink-0' />
                          <span>{booking.attendees} participants</span>
                        </div>
                      )}
                    </div>
                    <div className='text-sm'>
                      <span className='font-medium text-gray-900 dark:text-gray-100'>
                        Purpose:{' '}
                      </span>
                      <span className='text-gray-600 dark:text-gray-400 break-words'>
                        {booking.purpose}
                      </span>
                    </div>
                    {booking.remarks && (
                      <div className='text-sm'>
                        <span className='font-medium text-gray-900 dark:text-gray-100'>
                          Remarks:{' '}
                        </span>
                        <span className='text-gray-600 dark:text-gray-400 break-words'>
                          {booking.remarks}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className='flex flex-col sm:flex-row sm:justify-between gap-3 pt-4'>
                  <span className='text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left'>
                    Booked on {formatDateTime(booking.createdAt)}
                  </span>
                  {booking.status === 'PENDING' && (
                    <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                      <Button
                        variant='default'
                        size='sm'
                        className='w-full sm:w-auto'
                        onClick={() =>
                          handleOpenActionDialog(booking, 'APPROVED')
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        className='w-full sm:w-auto'
                        onClick={() =>
                          handleOpenActionDialog(booking, 'REJECTED')
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && bookings.length > 0 && (
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left'>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} bookings
            </p>
            <div className='flex gap-2 justify-center sm:justify-end'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 sm:flex-none'
                disabled={pagination.page === 1}
                onClick={() =>
                  fetchBookings({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    status:
                      selectedStatus === 'ALL' ? undefined : selectedStatus,
                    search: searchQuery || undefined,
                    page: pagination.page - 1,
                    limit: pagination.limit,
                  })
                }
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 sm:flex-none'
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  console.log(
                    'Next page clicked. Current page:',
                    pagination.page,
                    'Total pages:',
                    pagination.totalPages
                  );
                  fetchBookings({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    status:
                      selectedStatus === 'ALL' ? undefined : selectedStatus,
                    search: searchQuery || undefined,
                    page: pagination.page + 1,
                    limit: pagination.limit,
                  });
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Handle Booking Dialog */}
      <Dialog open={handleDialogOpen} onOpenChange={setHandleDialogOpen}>
        <DialogContent className='mx-4 max-w-md sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-lg sm:text-xl'>
              {action === 'APPROVED' ? 'Approve' : 'Reject'} Booking
            </DialogTitle>
            <DialogDescription className='text-sm sm:text-base'>
              {action === 'APPROVED'
                ? 'Are you sure you want to approve this booking?'
                : 'Please provide a reason for rejecting this booking.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                Remarks {action === 'REJECTED' && '(Required)'}
              </Label>
              <Textarea
                placeholder={
                  action === 'APPROVED'
                    ? 'Optional remarks...'
                    : 'Reason for rejection...'
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className='min-h-[80px] resize-none'
              />
            </div>
          </div>

          <DialogFooter className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setHandleDialogOpen(false)}
              className='w-full sm:w-auto'
            >
              Cancel
            </Button>
            <Button
              variant={action === 'APPROVED' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              disabled={action === 'REJECTED' && !remarks.trim()}
              className='w-full sm:w-auto'
            >
              {action === 'APPROVED' ? 'Approve' : 'Reject'} Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomBookingManagementClient;
