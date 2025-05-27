'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  BarChart4,
  Calendar,
  FileText,
  DoorOpen,
  Clock,
  GraduationCap,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

const StudentDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'forms':
        return <FormsPanel />;
      case 'rooms':
        return <RoomsPanel />;
      case 'bookings':
        return <BookingsPanel />;
      case 'events':
        return <EventsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return <StudentDashboardLayout>{getCurrentContent()}</StudentDashboardLayout>;
};

const OverviewPanel: React.FC = () => {
  const stats = [
    {
      title: 'Pending Forms',
      value: 2,
      change: 'Awaiting action',
      icon: <FileText className='text-primary' />,
    },
    {
      title: 'Upcoming Events',
      value: 3,
      change: 'Registered',
      icon: <Calendar className='text-primary' />,
    },
    {
      title: 'Room Bookings',
      value: 1,
      change: 'This week',
      icon: <DoorOpen className='text-primary' />,
    },
    {
      title: 'Completed Forms',
      value: 5,
      change: 'This semester',
      icon: <BarChart4 className='text-primary' />,
    },
  ];

  return (
    <div className='space-y-6'>
      <section>
        <h2 className='text-2xl font-semibold mb-4'>Welcome Back, Student!</h2>
        <p className='text-gray-600 mb-6'>
          Here's an overview of your academic progress and upcoming activities.
        </p>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat, i) => (
            <Card key={i} className='overflow-hidden'>
              <CardHeader className='pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0'>
                <CardTitle className='text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent className='px-4 pb-4'>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-xs text-muted-foreground'>{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              {[
                {
                  name: 'Study Room 101',
                  date: 'May 28, 2025',
                  time: '13:00 - 15:00',
                  status: 'Confirmed',
                },
                {
                  name: 'Conference Room A',
                  date: 'June 3, 2025',
                  time: '10:00 - 12:00',
                  status: 'Pending',
                },
              ].map((booking, i) => (
                <li
                  key={i}
                  className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
                >
                  <div>
                    <p className='font-medium'>{booking.name}</p>
                    <p className='text-sm text-gray-500'>
                      {booking.date}, {booking.time}
                    </p>
                  </div>
                  <span
                    className={`text-xs py-1 px-2 rounded ${
                      booking.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              {[
                {
                  name: 'Tuition Discount Application',
                  date: 'Submitted: May 20, 2025',
                  status: 'Under Review',
                },
                {
                  name: 'Absence Report',
                  date: 'Submitted: May 15, 2025',
                  status: 'Approved',
                },
              ].map((form, i) => (
                <li
                  key={i}
                  className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
                >
                  <div>
                    <p className='font-medium'>{form.name}</p>
                    <p className='text-sm text-gray-500'>{form.date}</p>
                  </div>
                  <span
                    className={`text-xs py-1 px-2 rounded ${
                      form.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : form.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {form.status}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {[
              {
                name: 'Career Development Workshop',
                date: 'May 29, 2025',
                location: 'Main Auditorium',
                registration: 'Open',
              },
              {
                name: 'Student Exchange Program Info Session',
                date: 'June 2, 2025',
                location: 'Virtual Meeting',
                registration: 'Open',
              },
              {
                name: 'Annual Science Fair',
                date: 'June 10, 2025',
                location: 'Science Building',
                registration: 'Registered',
              },
            ].map((event, i) => (
              <li
                key={i}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <p className='font-medium'>{event.name}</p>
                  <p className='text-sm text-gray-500'>
                    {event.date} • {event.location}
                  </p>
                </div>
                <span
                  className={`text-xs py-1 px-2 rounded ${
                    event.registration === 'Registered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {event.registration}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Student-specific panels for each section
const FormsPanel: React.FC = () => (
  <div className='space-y-6'>
    <h2 className='text-2xl font-semibold mb-4'>Administrative Forms</h2>

    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>My Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {[
              {
                name: 'Tuition Discount Application',
                date: 'Submitted: May 20, 2025',
                status: 'Under Review',
              },
              {
                name: 'Absence Report',
                date: 'Submitted: May 15, 2025',
                status: 'Approved',
              },
              {
                name: 'Course Transfer Request',
                date: 'Submitted: April 5, 2025',
                status: 'Rejected',
              },
              {
                name: 'Scholarship Application',
                date: 'Submitted: March 10, 2025',
                status: 'Approved',
              },
            ].map((form, i) => (
              <li
                key={i}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <p className='font-medium'>{form.name}</p>
                  <p className='text-sm text-gray-500'>{form.date}</p>
                </div>
                <span
                  className={`text-xs py-1 px-2 rounded ${
                    form.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : form.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {form.status}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {[
              {
                name: 'Medical Exemption Request',
                description: 'Request exemption from physical activities',
              },
              {
                name: 'Study Abroad Application',
                description: 'Apply for international exchange programs',
              },
              {
                name: 'Tuition Payment Plan',
                description: 'Request installment payments for tuition',
              },
              {
                name: 'Special Learning Accommodations',
                description: 'Request special learning accommodations',
              },
            ].map((form, i) => (
              <li
                key={i}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <p className='font-medium'>{form.name}</p>
                  <p className='text-sm text-gray-500'>{form.description}</p>
                </div>
                <span className='text-xs bg-primary-100 text-primary-800 py-1 px-2 rounded'>
                  Submit
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

const RoomsPanel: React.FC = () => (
  <div className='space-y-6'>
    <h2 className='text-2xl font-semibold mb-4'>Room Directory</h2>
    <div className='grid gap-6 md:grid-cols-3'>
      {[
        {
          name: 'Study Room 101',
          capacity: '4 people',
          features: 'Whiteboard, Projector',
          availableSlots: 8,
        },
        {
          name: 'Conference Room A',
          capacity: '12 people',
          features: 'Video Conference, Smart Board',
          availableSlots: 3,
        },
        {
          name: 'Study Room 102',
          capacity: '6 people',
          features: 'Whiteboard, PC Workstations',
          availableSlots: 5,
        },
        {
          name: 'Multimedia Lab',
          capacity: '20 people',
          features: 'Audio/Video Equipment, Editing Software',
          availableSlots: 2,
        },
        {
          name: 'Group Room B',
          capacity: '8 people',
          features: 'Whiteboard, TV Screen',
          availableSlots: 0,
        },
        {
          name: 'Library Quiet Room',
          capacity: '10 people',
          features: 'Individual Study Carrels',
          availableSlots: 6,
        },
      ].map((room, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className='flex justify-between items-center'>
              <span>{room.name}</span>
              <span
                className={`text-xs py-1 px-2 rounded ${room.availableSlots > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {room.availableSlots > 0 ? 'Available' : 'Fully Booked'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p>
                <span className='font-medium'>Capacity:</span> {room.capacity}
              </p>
              <p>
                <span className='font-medium'>Features:</span> {room.features}
              </p>
              <p>
                <span className='font-medium'>Available Slots:</span>{' '}
                {room.availableSlots}
              </p>
              <button
                disabled={room.availableSlots === 0}
                className={`mt-2 w-full py-1.5 px-3 text-sm rounded-md ${
                  room.availableSlots > 0
                    ? 'bg-primary text-white hover:bg-primary-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {room.availableSlots > 0 ? 'Book Room' : 'Unavailable'}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const BookingsPanel: React.FC = () => (
  <div className='space-y-6'>
    <h2 className='text-2xl font-semibold mb-4'>My Bookings</h2>

    <div className='mb-6'>
      <Card>
        <CardHeader>
          <CardTitle>Current Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {[
              {
                name: 'Study Room 101',
                date: 'May 28, 2025',
                time: '13:00 - 15:00',
                status: 'Confirmed',
                id: 'BK-1001',
              },
              {
                name: 'Conference Room A',
                date: 'June 3, 2025',
                time: '10:00 - 12:00',
                status: 'Pending',
                id: 'BK-1002',
              },
            ].map((booking, i) => (
              <li
                key={i}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium'>{booking.name}</p>
                    <span className='text-xs text-gray-500'>#{booking.id}</span>
                  </div>
                  <p className='text-sm text-gray-500'>
                    {booking.date}, {booking.time}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`text-xs py-1 px-2 rounded ${
                      booking.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                  <button className='text-xs bg-red-50 text-red-800 px-2 py-1 rounded hover:bg-red-100'>
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>

    <div>
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-3'>
            {[
              {
                name: 'Library Quiet Room',
                date: 'May 15, 2025',
                time: '09:00 - 11:00',
                status: 'Completed',
                id: 'BK-0982',
              },
              {
                name: 'Study Room 102',
                date: 'May 10, 2025',
                time: '14:00 - 16:00',
                status: 'Cancelled',
                id: 'BK-0975',
              },
              {
                name: 'Group Room B',
                date: 'May 5, 2025',
                time: '13:00 - 15:00',
                status: 'Completed',
                id: 'BK-0968',
              },
            ].map((booking, i) => (
              <li
                key={i}
                className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
              >
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium'>{booking.name}</p>
                    <span className='text-xs text-gray-500'>#{booking.id}</span>
                  </div>
                  <p className='text-sm text-gray-500'>
                    {booking.date}, {booking.time}
                  </p>
                </div>
                <span
                  className={`text-xs py-1 px-2 rounded ${
                    booking.status === 'Completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

const EventsPanel: React.FC = () => (
  <div className='space-y-6'>
    <h2 className='text-2xl font-semibold mb-4'>Event Registration</h2>

    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {[
        {
          name: 'Career Development Workshop',
          date: 'May 29, 2025',
          time: '14:00 - 16:00',
          location: 'Main Auditorium',
          registration: 'Open',
          description:
            'Learn essential skills for job interviews and resume building',
          speaker: 'Dr. Emma Johnson, Career Counselor',
        },
        {
          name: 'Student Exchange Program Info Session',
          date: 'June 2, 2025',
          time: '11:00 - 12:30',
          location: 'Virtual Meeting',
          registration: 'Open',
          description:
            'Information about study abroad opportunities in Fall 2025',
          speaker: 'International Studies Department',
        },
        {
          name: 'Annual Science Fair',
          date: 'June 10, 2025',
          time: '10:00 - 16:00',
          location: 'Science Building',
          registration: 'Registered',
          description: 'Showcase of student research projects and innovations',
          speaker: 'Faculty of Natural Sciences',
        },
        {
          name: 'Cultural Diversity Day',
          date: 'June 15, 2025',
          time: '12:00 - 18:00',
          location: 'Campus Square',
          registration: 'Open',
          description:
            'Celebrate cultural diversity with food, music and performances',
          speaker: 'Student Cultural Association',
        },
        {
          name: 'Alumni Networking Night',
          date: 'June 20, 2025',
          time: '18:00 - 21:00',
          location: 'Grand Hall',
          registration: 'Full',
          description: 'Connect with successful graduates from your program',
          speaker: 'Alumni Relations Office',
        },
        {
          name: 'Tech Innovation Summit',
          date: 'June 25, 2025',
          time: '9:00 - 17:00',
          location: 'Technology Center',
          registration: 'Open',
          description: 'Latest trends in technology and innovation',
          speaker: 'Various Industry Experts',
        },
      ].map((event, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='text-sm text-gray-500'>{event.date}</p>
              <p className='text-sm text-gray-500'>{event.time}</p>
              <p className='text-sm text-gray-500'>{event.location}</p>
            </div>
            <p className='text-sm'>{event.description}</p>
            <p className='text-sm'>
              <span className='font-medium'>Presenter:</span> {event.speaker}
            </p>
            <div className='flex justify-between items-center'>
              <span
                className={`text-xs py-1 px-2 rounded ${
                  event.registration === 'Registered'
                    ? 'bg-green-100 text-green-800'
                    : event.registration === 'Full'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                }`}
              >
                {event.registration}
              </span>
              <button
                disabled={
                  event.registration === 'Full' ||
                  event.registration === 'Registered'
                }
                className={`text-sm py-1 px-3 rounded ${
                  event.registration === 'Open'
                    ? 'bg-primary text-white hover:bg-primary-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {event.registration === 'Open'
                  ? 'Register'
                  : event.registration === 'Registered'
                    ? 'Registered'
                    : 'Full'}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const SettingsPanel: React.FC = () => (
  <div>
    <h2 className='text-2xl font-semibold mb-4'>Settings</h2>
    <p className='text-gray-500'>User settings will be displayed here.</p>

    <Card className='mt-6'>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Email Notifications</label>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-md'>
              <span>Receive booking confirmations</span>
              <div className='w-10 h-5 bg-green-500 rounded-full relative'>
                <div className='w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5'></div>
              </div>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-md'>
              <span>Receive event reminders</span>
              <div className='w-10 h-5 bg-green-500 rounded-full relative'>
                <div className='w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5'></div>
              </div>
            </div>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-md'>
              <span>Receive form status updates</span>
              <div className='w-10 h-5 bg-green-500 rounded-full relative'>
                <div className='w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5'></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default StudentDashboardPage;
