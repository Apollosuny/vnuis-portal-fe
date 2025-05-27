'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { BarChart4, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

const StudentDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'courses':
        return <CoursesPanel />;
      case 'schedule':
        return <SchedulePanel />;
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
      title: 'Upcoming Classes',
      value: 4,
      change: 'This week',
      icon: <BookOpen className='text-primary' />,
    },
    {
      title: 'Upcoming Events',
      value: 2,
      change: 'This month',
      icon: <Calendar className='text-primary' />,
    },
    {
      title: 'Enrolled Courses',
      value: 6,
      change: 'Current semester',
      icon: <GraduationCap className='text-primary' />,
    },
    {
      title: 'Completed Courses',
      value: 12,
      change: 'Total',
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
            <CardTitle>This Week's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              {[
                {
                  day: 'Monday',
                  course: 'Mathematics 101',
                  time: '10:00 - 12:00',
                  room: 'Room A101',
                },
                {
                  day: 'Tuesday',
                  course: 'Physics Lab',
                  time: '14:00 - 16:00',
                  room: 'Lab B205',
                },
                {
                  day: 'Wednesday',
                  course: 'Computer Science',
                  time: '09:00 - 11:00',
                  room: 'Room C302',
                },
                {
                  day: 'Friday',
                  course: 'Literature',
                  time: '13:00 - 15:00',
                  room: 'Room D405',
                },
              ].map((item, i) => (
                <li
                  key={i}
                  className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
                >
                  <div>
                    <p className='font-medium'>{item.course}</p>
                    <p className='text-sm text-gray-500'>
                      {item.day}, {item.time}
                    </p>
                  </div>
                  <span className='text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded'>
                    {item.room}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              {[
                {
                  name: 'Final Exams Registration',
                  date: 'May 30, 2025',
                  type: 'Academic',
                },
                {
                  name: 'Campus Career Fair',
                  date: 'June 5, 2025',
                  type: 'Event',
                },
              ].map((event, i) => (
                <li
                  key={i}
                  className='flex justify-between items-center p-3 bg-gray-50 rounded-md'
                >
                  <div>
                    <p className='font-medium'>{event.name}</p>
                    <p className='text-sm text-gray-500'>{event.date}</p>
                  </div>
                  <span
                    className={`text-xs py-1 px-2 rounded ${
                      event.type === 'Academic'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.type}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

// Placeholder panels for other tabs
const CoursesPanel: React.FC = () => (
  <div>
    <h2 className='text-2xl font-semibold mb-4'>My Courses</h2>
    <p className='text-gray-500'>Course content will be displayed here.</p>
  </div>
);

const SchedulePanel: React.FC = () => (
  <div>
    <h2 className='text-2xl font-semibold mb-4'>My Schedule</h2>
    <p className='text-gray-500'>Schedule content will be displayed here.</p>
  </div>
);

const EventsPanel: React.FC = () => (
  <div>
    <h2 className='text-2xl font-semibold mb-4'>Events</h2>
    <p className='text-gray-500'>Events content will be displayed here.</p>
  </div>
);

const SettingsPanel: React.FC = () => (
  <div>
    <h2 className='text-2xl font-semibold mb-4'>Settings</h2>
    <p className='text-gray-500'>Settings content will be displayed here.</p>
  </div>
);

export default StudentDashboardPage;
