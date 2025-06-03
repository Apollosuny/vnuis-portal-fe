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
    <div>
      {/* Filters */}
      <div className='mb-6 space-y-4'>
        <h1 className='text-2xl font-bold'>Room Bookings</h1>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <Label>Start Date</Label>
            <Input
              type='date'
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type='date'
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
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
            <Label>Search</Label>
            <div className='relative'>
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
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle>
                      {booking.room?.name || 'Unknown Room'}
                    </CardTitle>
                    <CardDescription>{booking.room?.location}</CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
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
              <CardContent>
                <div className='grid gap-3'>
                  <div className='grid gap-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span>{formatDateTime(booking.startTime)}</span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <Clock className='h-4 w-4 text-gray-500' />
                      <span>
                        {DateTime.fromISO(booking.endTime).toFormat('HH:mm')} (
                        {booking.duration} hours)
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-sm'>
                      <MapPin className='h-4 w-4 text-gray-500' />
                      <span>{booking.room?.location}</span>
                    </div>
                    {booking.attendees && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Users className='h-4 w-4 text-gray-500' />
                        <span>{booking.attendees} participants</span>
                      </div>
                    )}
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Purpose: </span>
                    <span className='text-gray-600'>{booking.purpose}</span>
                  </div>
                  {booking.remarks && (
                    <div className='text-sm'>
                      <span className='font-medium'>Remarks: </span>
                      <span className='text-gray-600'>{booking.remarks}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <span className='text-sm text-gray-500'>
                  Booked on {formatDateTime(booking.createdAt)}
                </span>
                {booking.status === 'PENDING' && (
                  <div className='flex gap-2'>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() =>
                        handleOpenActionDialog(booking, 'APPROVED')
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
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
          ))
        )}

        {/* Pagination */}
        {!loading && !error && bookings.length > 0 && (
          <div className='flex justify-between items-center mt-4'>
            <p className='text-sm text-gray-500'>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} bookings
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
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
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  fetchBookings({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    status:
                      selectedStatus === 'ALL' ? undefined : selectedStatus,
                    search: searchQuery || undefined,
                    page: pagination.page + 1,
                    limit: pagination.limit,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Handle Booking Dialog */}
      <Dialog open={handleDialogOpen} onOpenChange={setHandleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'APPROVED' ? 'Approve' : 'Reject'} Booking
            </DialogTitle>
            <DialogDescription>
              {action === 'APPROVED'
                ? 'Are you sure you want to approve this booking?'
                : 'Please provide a reason for rejecting this booking.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Remarks {action === 'REJECTED' && '(Required)'}</Label>
              <Textarea
                placeholder={
                  action === 'APPROVED'
                    ? 'Optional remarks...'
                    : 'Reason for rejection...'
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setHandleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'APPROVED' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              disabled={action === 'REJECTED' && !remarks.trim()}
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
