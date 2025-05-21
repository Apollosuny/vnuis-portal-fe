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
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
  X,
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

// Mock data for room bookings
const mockBookings = [
  {
    id: 'booking-1',
    room: { id: 'room-1', name: 'Lecture Hall A', location: 'Main Building' },
    status: 'PENDING',
    purpose: 'Group Study Session',
    startTime: '2025-05-25T14:00:00Z',
    endTime: '2025-05-25T16:00:00Z',
    student: { id: 'student-1', name: 'John Doe', studentId: 'STU20210001' },
  },
  {
    id: 'booking-2',
    room: {
      id: 'room-2',
      name: 'Seminar Room 101',
      location: 'Science Building',
    },
    status: 'APPROVED',
    purpose: 'Department Meeting',
    startTime: '2025-05-26T10:00:00Z',
    endTime: '2025-05-26T12:00:00Z',
    student: { id: 'student-2', name: 'Jane Smith', studentId: 'STU20210012' },
  },
  {
    id: 'booking-3',
    room: {
      id: 'room-3',
      name: 'Computer Lab 3',
      location: 'Technology Center',
    },
    status: 'REJECTED',
    purpose: 'Programming Workshop',
    startTime: '2025-05-24T09:00:00Z',
    endTime: '2025-05-24T12:00:00Z',
    student: {
      id: 'student-3',
      name: 'Mike Johnson',
      studentId: 'STU20210034',
    },
  },
  {
    id: 'booking-4',
    room: {
      id: 'room-4',
      name: 'Conference Room B',
      location: 'Admin Building',
    },
    status: 'PENDING',
    purpose: 'Club Meeting',
    startTime: '2025-05-27T15:30:00Z',
    endTime: '2025-05-27T17:00:00Z',
    student: {
      id: 'student-4',
      name: 'Sarah Williams',
      studentId: 'STU20220056',
    },
  },
  {
    id: 'booking-5',
    room: { id: 'room-5', name: 'Auditorium', location: 'Main Building' },
    status: 'APPROVED',
    purpose: 'Guest Lecture',
    startTime: '2025-05-28T13:00:00Z',
    endTime: '2025-05-28T15:00:00Z',
    student: { id: 'student-5', name: 'Alex Brown', studentId: 'STU20210078' },
  },
];

const BookingsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter bookings based on search term and status
  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.student.studentId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get time period (start-end)
  const getTimePeriod = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(start);

    const endStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(end);

    return `${startStr} - ${endStr}`;
  };

  // Format date only
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Render badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className='bg-emerald-500'>Approved</Badge>;
      case 'REJECTED':
        return <Badge className='bg-destructive'>Rejected</Badge>;
      case 'PENDING':
        return <Badge className='bg-amber-500'>Pending</Badge>;
      case 'CANCELLED':
        return <Badge className='bg-gray-500'>Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge className='bg-blue-500'>Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search bookings...'
              className='pl-8 w-[280px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='APPROVED'>Approved</SelectItem>
                <SelectItem value='REJECTED'>Rejected</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className='px-6'>
          <div className='flex justify-between items-center'>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='size-5' />
              <span>Room Bookings</span>
            </CardTitle>
            <Badge className='bg-primary'>
              {filteredBookings.length} Bookings
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='px-6'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className='font-medium'>{booking.room.name}</div>
                    <div className='text-xs text-muted-foreground flex items-center gap-1'>
                      <MapPin className='size-3' /> {booking.room.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span>{booking.student.name}</span>
                      <span className='text-xs text-muted-foreground'>
                        {booking.student.studentId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span>{formatDate(booking.startTime)}</span>
                      <span className='text-xs text-muted-foreground flex items-center gap-1'>
                        <Clock className='size-3' />{' '}
                        {getTimePeriod(booking.startTime, booking.endTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.purpose}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 px-2'
                          >
                            <CheckCircle className='size-4 text-emerald-500' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 px-2'
                          >
                            <X className='size-4 text-destructive' />
                          </Button>
                        </>
                      )}
                      <Button variant='outline' size='sm' className='h-7'>
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className='px-6 border-t flex justify-between'>
          <div className='text-sm text-muted-foreground'>
            Showing {filteredBookings.length} of {mockBookings.length} bookings
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' disabled>
              Previous
            </Button>
            <Button variant='outline' size='sm' disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingsPanel;
