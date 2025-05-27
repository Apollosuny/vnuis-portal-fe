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
  Users,
  Calendar,
  Clock,
  MapPin,
  Ticket,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

// Mock data for events
const events = [
  {
    id: 'E001',
    name: 'Career Development Workshop',
    date: 'May 29, 2025',
    time: '14:00 - 16:00',
    location: 'Main Auditorium',
    building: 'Student Center',
    status: 'Open',
    registered: false,
    description:
      'Learn essential skills for job interviews and resume building.',
    organizer: 'Career Services',
    speaker: 'Dr. Emma Johnson, Career Counselor',
    type: 'Workshop',
    capacity: 100,
    attendees: 45,
    tags: ['career', 'professional development', 'workshop'],
    image: '/assets/career-workshop.jpg',
    registrationDeadline: 'May 28, 2025',
  },
  {
    id: 'E002',
    name: 'Student Exchange Program Info Session',
    date: 'June 2, 2025',
    time: '11:00 - 12:30',
    location: 'Virtual Meeting',
    building: 'Online',
    status: 'Open',
    registered: false,
    description: 'Information about study abroad opportunities in Fall 2025.',
    organizer: 'International Studies Department',
    speaker: 'International Studies Department',
    type: 'Information Session',
    capacity: 200,
    attendees: 78,
    tags: ['study abroad', 'information', 'international', 'academic'],
    image: '/assets/exchange-program.jpg',
    registrationDeadline: 'May 31, 2025',
  },
  {
    id: 'E003',
    name: 'Annual Science Fair',
    date: 'June 10, 2025',
    time: '10:00 - 16:00',
    location: 'Science Building',
    building: 'Science Complex',
    status: 'Open',
    registered: true,
    description: 'Showcase of student research projects and innovations.',
    organizer: 'Faculty of Natural Sciences',
    speaker: 'Various student presenters',
    type: 'Exhibition',
    capacity: 300,
    attendees: 154,
    tags: ['science', 'research', 'showcase', 'academic'],
    image: '/assets/science-fair.jpg',
    registrationDeadline: 'June 5, 2025',
  },
  {
    id: 'E004',
    name: 'Cultural Diversity Day',
    date: 'June 15, 2025',
    time: '12:00 - 18:00',
    location: 'Campus Square',
    building: 'Outdoor',
    status: 'Open',
    registered: false,
    description:
      'Celebrate cultural diversity with food, music and performances.',
    organizer: 'Student Cultural Association',
    speaker: 'Various cultural clubs',
    type: 'Festival',
    capacity: 500,
    attendees: 238,
    tags: ['culture', 'diversity', 'entertainment', 'food'],
    image: '/assets/cultural-day.jpg',
    registrationDeadline: 'June 10, 2025',
  },
  {
    id: 'E005',
    name: 'Alumni Networking Night',
    date: 'June 20, 2025',
    time: '18:00 - 21:00',
    location: 'Grand Hall',
    building: 'Alumni Center',
    status: 'Full',
    registered: false,
    description: 'Connect with successful graduates from your program.',
    organizer: 'Alumni Relations Office',
    speaker: 'Various alumni speakers',
    type: 'Networking',
    capacity: 150,
    attendees: 150,
    tags: ['networking', 'career', 'alumni', 'professional'],
    image: '/assets/alumni-night.jpg',
    registrationDeadline: 'June 15, 2025',
  },
  {
    id: 'E006',
    name: 'Tech Innovation Summit',
    date: 'June 25, 2025',
    time: '09:00 - 17:00',
    location: 'Technology Center',
    building: 'Engineering Building',
    status: 'Open',
    registered: false,
    description: 'Latest trends in technology and innovation.',
    organizer: 'School of Engineering',
    speaker: 'Various Industry Experts',
    type: 'Conference',
    capacity: 200,
    attendees: 89,
    tags: ['technology', 'innovation', 'engineering', 'conference'],
    image: '/assets/tech-summit.jpg',
    registrationDeadline: 'June 20, 2025',
  },
  {
    id: 'E007',
    name: 'Campus Sustainability Week',
    date: 'July 5-9, 2025',
    time: 'Various times',
    location: 'Various locations',
    building: 'Multiple venues',
    status: 'Open',
    registered: false,
    description:
      'A week dedicated to environmental awareness and sustainable practices on campus.',
    organizer: 'Environmental Club',
    speaker: 'Environmental activists and faculty',
    type: 'Seminar Series',
    capacity: 300,
    attendees: 120,
    tags: ['environment', 'sustainability', 'seminar', 'campus'],
    image: '/assets/sustainability.jpg',
    registrationDeadline: 'July 1, 2025',
  },
  {
    id: 'E008',
    name: 'Literary Festival',
    date: 'July 15, 2025',
    time: '13:00 - 20:00',
    location: 'University Library',
    building: 'Main Library',
    status: 'Open',
    registered: false,
    description:
      'Celebrating literature with author readings, book launches, and panel discussions.',
    organizer: 'Department of Literature',
    speaker: 'Notable authors and poets',
    type: 'Festival',
    capacity: 180,
    attendees: 65,
    tags: ['literature', 'books', 'arts', 'culture'],
    image: '/assets/literary-fest.jpg',
    registrationDeadline: 'July 10, 2025',
  },
];

// Filter options
const eventTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'seminar', label: 'Seminars' },
  { value: 'conference', label: 'Conferences' },
  { value: 'exhibition', label: 'Exhibitions' },
  { value: 'festival', label: 'Festivals' },
  { value: 'networking', label: 'Networking' },
];

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Registration Open' },
  { value: 'registered', label: 'Registered' },
  { value: 'full', label: 'Full' },
];

const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Filter events based on selections
  const filteredEvents = events.filter((event) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag) => tag.includes(searchQuery.toLowerCase()));

    // Filter by event type
    const matchesType =
      selectedType === 'all' ||
      event.type.toLowerCase().includes(selectedType.toLowerCase());

    // Filter by status
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'registered' && event.registered) ||
      event.status.toLowerCase() === selectedStatus.toLowerCase();

    // Filter by tab
    if (activeTab === 'upcoming') {
      const datePart = event.date.split('-')[0] || event.date; // Handle ranges like "July 5-9, 2025"
      const eventDate = new Date(datePart);
      const today = new Date();
      return (
        matchesSearch && matchesType && matchesStatus && eventDate >= today
      );
    }

    if (activeTab === 'registered') {
      return matchesSearch && matchesType && event.registered;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  const handleRegisterEvent = (eventId: string) => {
    // In a real app, this would make an API call to register
    console.log('Registering for event:', eventId);
  };

  const handleCancelRegistration = (eventId: string) => {
    // In a real app, this would make an API call to cancel
    console.log('Cancelling registration for event:', eventId);
  };

  const getRegisteredEventsCount = () => {
    return events.filter((event) => event.registered).length;
  };

  const getUpcomingEventsCount = () => {
    const today = new Date();
    return events.filter((event) => {
      const datePart = event.date.split('-')[0] || event.date;
      const eventDate = new Date(datePart);
      return eventDate >= today;
    }).length;
  };

  const renderEventCard = (event: any) => (
    <Card
      key={event.id}
      className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
      onClick={() => handleEventClick(event)}
    >
      <div className='h-48 bg-gray-100 relative'>
        {/* In a real app, this would be an actual image */}
        <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
          {event.name} Image
        </div>
        {event.registered && (
          <div className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
            Registered
          </div>
        )}
      </div>
      <CardHeader className='pb-2'>
        <div className='flex justify-between'>
          <div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.type}</CardDescription>
          </div>
          <span
            className={`text-xs py-1 px-2 rounded ${
              event.status === 'Full'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {event.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='space-y-2'>
          <div className='flex items-center text-sm text-gray-500'>
            <Calendar className='h-4 w-4 mr-2' />
            {event.date}
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <Clock className='h-4 w-4 mr-2' />
            {event.time}
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <MapPin className='h-4 w-4 mr-2' />
            {event.location}
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <Users className='h-4 w-4 mr-2' />
            {event.attendees}/{event.capacity} registered
          </div>
        </div>
        <p className='mt-3 text-sm line-clamp-2 text-gray-600'>
          {event.description}
        </p>
      </CardContent>
      <CardFooter>
        {event.registered ? (
          <Button
            variant='outline'
            className='w-full'
            onClick={(e) => {
              e.stopPropagation();
              handleCancelRegistration(event.id);
            }}
          >
            Cancel Registration
          </Button>
        ) : (
          <Button
            className='w-full'
            disabled={event.status === 'Full'}
            onClick={(e) => {
              e.stopPropagation();
              handleRegisterEvent(event.id);
            }}
          >
            {event.status === 'Full' ? 'Event Full' : 'Register'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <StudentDashboardLayout>
      <div className='space-y-6'>
        {!selectedEvent ? (
          <>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <h1 className='text-2xl font-semibold'>Event Registration</h1>

              {/* Search and filter controls */}
              <div className='flex flex-wrap gap-2 w-full md:w-auto'>
                <div className='relative flex-1 md:flex-none'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search events...'
                    className='pl-9 py-2 pr-4 border rounded-md w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className='relative flex-1 md:flex-none'>
                  <select
                    className='appearance-none pl-3 pr-8 py-2 border rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Filter className='absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none' />
                </div>

                <div className='relative flex-1 md:flex-none'>
                  <select
                    className='appearance-none pl-3 pr-8 py-2 border rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statusFilters.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
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
              defaultValue='upcoming'
              value={activeTab}
              onValueChange={setActiveTab}
              className='space-y-4'
            >
              <TabsList className='grid w-[400px] grid-cols-2'>
                <TabsTrigger value='upcoming'>
                  Upcoming Events
                  <span className='ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-primary text-white rounded-full'>
                    {getUpcomingEventsCount()}
                  </span>
                </TabsTrigger>
                <TabsTrigger value='registered'>
                  My Registrations
                  <span className='ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-green-200 text-green-800 rounded-full'>
                    {getRegisteredEventsCount()}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='upcoming' className='space-y-4'>
                {filteredEvents.length > 0 ? (
                  <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredEvents.map(renderEventCard)}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <div className='rounded-full bg-gray-100 p-6 mb-4'>
                      <Calendar className='h-12 w-12 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700'>
                      No events found
                    </h3>
                    <p className='text-gray-500 mt-2 max-w-sm'>
                      There are no events matching your criteria. Try adjusting
                      your filters.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='registered' className='space-y-4'>
                {filteredEvents.length > 0 ? (
                  <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredEvents.map(renderEventCard)}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <div className='rounded-full bg-gray-100 p-6 mb-4'>
                      <Ticket className='h-12 w-12 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700'>
                      No registered events
                    </h3>
                    <p className='text-gray-500 mt-2 max-w-sm'>
                      You haven't registered for any events yet. Browse upcoming
                      events to get started.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // Event detail view
          <div className='space-y-6'>
            <Button variant='outline' onClick={handleCloseDetail}>
              ← Back to Events
            </Button>

            <div className='grid gap-6 md:grid-cols-2'>
              <div>
                <div className='h-72 bg-gray-100 rounded-lg relative'>
                  {/* In a real app, this would be an actual image */}
                  <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
                    {selectedEvent.name} Image
                  </div>
                </div>

                <div className='mt-4'>
                  <h1 className='text-2xl font-semibold'>
                    {selectedEvent.name}
                  </h1>
                  <div className='flex items-center mt-2'>
                    <span
                      className={`text-xs py-1 px-3 rounded-full ${
                        selectedEvent.status === 'Full'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.registered && (
                      <span className='text-xs py-1 px-3 rounded-full bg-green-500 text-white ml-2'>
                        You're Registered
                      </span>
                    )}
                  </div>

                  <div className='mt-4 space-y-3'>
                    <div className='flex items-center'>
                      <Calendar className='h-5 w-5 text-primary mr-3' />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className='flex items-center'>
                      <Clock className='h-5 w-5 text-primary mr-3' />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className='flex items-center'>
                      <MapPin className='h-5 w-5 text-primary mr-3' />
                      <div>
                        <span className='block'>{selectedEvent.location}</span>
                        <span className='text-sm text-gray-500'>
                          {selectedEvent.building}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <Users className='h-5 w-5 text-primary mr-3' />
                      <div>
                        <span>
                          {selectedEvent.attendees}/{selectedEvent.capacity}{' '}
                          registered
                        </span>
                        <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                          <div
                            className='bg-primary h-1.5 rounded-full'
                            style={{
                              width: `${(selectedEvent.attendees / selectedEvent.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className='h-fit'>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <h3 className='font-medium mb-1'>Description</h3>
                    <p className='text-gray-700'>{selectedEvent.description}</p>
                  </div>

                  <div>
                    <h3 className='font-medium mb-1'>Organizer</h3>
                    <p className='text-gray-700'>{selectedEvent.organizer}</p>
                  </div>

                  <div>
                    <h3 className='font-medium mb-1'>Speaker(s)</h3>
                    <p className='text-gray-700'>{selectedEvent.speaker}</p>
                  </div>

                  <div>
                    <h3 className='font-medium mb-1'>Event Type</h3>
                    <p className='text-gray-700'>{selectedEvent.type}</p>
                  </div>

                  {selectedEvent.tags.length > 0 && (
                    <div>
                      <h3 className='font-medium mb-1'>Tags</h3>
                      <div className='flex flex-wrap gap-2'>
                        {selectedEvent.tags.map(
                          (tag: string, index: number) => (
                            <span
                              key={index}
                              className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded'
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className='pt-2'>
                    <h3 className='font-medium mb-1'>
                      Registration Information
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Registration deadline:{' '}
                      <span className='font-medium'>
                        {selectedEvent.registrationDeadline}
                      </span>
                    </p>
                  </div>

                  {selectedEvent.status === 'Full' &&
                    !selectedEvent.registered && (
                      <div className='bg-amber-50 p-4 rounded-md'>
                        <h4 className='text-sm font-medium text-amber-800'>
                          Event is Full
                        </h4>
                        <p className='text-sm text-amber-700 mt-1'>
                          This event has reached its capacity. Please check back
                          later in case spots open up.
                        </p>
                      </div>
                    )}
                </CardContent>
                <CardFooter>
                  {selectedEvent.registered ? (
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                    >
                      Cancel My Registration
                    </Button>
                  ) : (
                    <Button
                      className='w-full'
                      disabled={selectedEvent.status === 'Full'}
                      onClick={() => handleRegisterEvent(selectedEvent.id)}
                    >
                      {selectedEvent.status === 'Full'
                        ? 'Event Full'
                        : 'Register Now'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default EventsPage;
