'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { eventApi } from '@/api/event.api';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Info,
  User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user.store';
import { motion } from 'framer-motion';

type EventDetailClientProps = {
  eventId: string;
};

export const EventDetailClient = ({ eventId }: EventDetailClientProps) => {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const { student } = useUserStore();

  const {
    data: event,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: async () => await eventApi.getEvent(eventId),
    enabled: !!eventId,
  });

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await eventApi.registerEvent({
        eventId,
      });
      toast.success('Event registration successful');
      refetch();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setRegistering(false);
    }
  };

  const registration = useMemo(
    () =>
      event?.registrations.find(
        (register: EventRegistration) => register.studentId === student?.id
      ),
    [event]
  );

  const handleCancelRegistration = async () => {
    if (!registration) return;

    try {
      setRegistering(true);
      await eventApi.cancelRegistration(registration.id);
      toast.success('Registration cancelled successfully');
      refetch();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setRegistering(false);
    }
  };

  const isRegistrationOpen = (event: Event) => {
    if (event.registrationDeadline) {
      return DateTime.fromISO(event.registrationDeadline) > DateTime.now();
    }
    return DateTime.fromISO(event.startTime) > DateTime.now();
  };

  const getRegistrationStatus = () => {
    if (!registration) {
      return isRegistrationOpen(event!) ? 'Open' : 'Closed';
    }
    return registration.status;
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case EventRegistrationStatus.APPROVED:
        return 'default';
      case EventRegistrationStatus.REJECTED:
        return 'destructive';
      case EventRegistrationStatus.CANCELLED:
        return 'outline';
      case EventRegistrationStatus.ATTENDED:
        return 'default';
      case 'Open':
        return 'default';
      case 'Closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (isLoading || !event) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spinner size='lg' />
        </motion.div>
      </div>
    );
  }

  const status = getRegistrationStatus();
  const canRegister = !registration && isRegistrationOpen(event);
  const showCancelButton =
    registration && registration.status === EventRegistrationStatus.PENDING;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className='space-y-8 p-4 md:p-8 max-w-5xl mx-auto'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className='flex items-center gap-4'>
        <Button
          variant='ghost'
          className='p-0 h-auto hover:scale-105 transition-transform'
          onClick={() => router.back()}
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className='overflow-hidden border-none shadow-lg'>
          {event.imageUrl && (
            <motion.div
              className='relative w-full h-[350px]'
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={event.imageUrl}
                alt={event.name}
                className='w-full h-full object-cover rounded-t-lg'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
              <div className='absolute bottom-0 left-0 p-6 text-white'>
                <Badge
                  variant={getBadgeColor(status)}
                  className='mb-2 px-3 py-1 text-xs font-semibold'
                >
                  {status}
                </Badge>
                <h1 className='text-3xl font-bold mb-2 drop-shadow-sm'>
                  {event.name}
                </h1>
                {event.category && (
                  <Badge variant='outline' className='text-white border-white'>
                    {event.category}
                  </Badge>
                )}
              </div>
            </motion.div>
          )}

          <CardContent className='p-6 space-y-8'>
            <motion.div
              variants={itemVariants}
              className='prose max-w-none bg-gray-50 dark:bg-gray-800/40 p-5 rounded-lg'
            >
              <CardDescription className='text-base mb-2 font-medium text-gray-700 dark:text-gray-300'>
                <Info className='h-4 w-4 inline mr-2' />
                Event Description
              </CardDescription>
              <p className='text-gray-700 dark:text-gray-300'>
                {event.description}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className='grid md:grid-cols-2 gap-6'
            >
              <div className='space-y-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-lg'>
                <CardDescription className='text-base font-medium text-gray-700 dark:text-gray-300 mb-4'>
                  <Calendar className='h-4 w-4 inline mr-2' />
                  Date & Time
                </CardDescription>

                <motion.div
                  className='flex items-center gap-3 pl-2 border-l-2 border-primary'
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Calendar className='h-5 w-5 text-primary' />
                  <span className='font-medium'>
                    {DateTime.fromISO(event.startTime).toFormat(
                      'EEEE, MMMM d, yyyy'
                    )}
                  </span>
                </motion.div>

                <motion.div
                  className='flex items-center gap-3 pl-2 border-l-2 border-primary'
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Clock className='h-5 w-5 text-primary' />
                  <span className='font-medium'>
                    {DateTime.fromISO(event.startTime).toFormat('h:mm a')} -{' '}
                    {DateTime.fromISO(event.endTime).toFormat('h:mm a')}
                  </span>
                </motion.div>

                {event.registrationDeadline && (
                  <div className='mt-4 text-sm pl-2 text-amber-600 dark:text-amber-400 font-semibold'>
                    Registration closes on{' '}
                    {DateTime.fromISO(event.registrationDeadline).toFormat(
                      'MMMM d, yyyy h:mm a'
                    )}
                  </div>
                )}
              </div>

              <div className='space-y-4 bg-gray-50 dark:bg-gray-800/40 p-5 rounded-lg'>
                <CardDescription className='text-base font-medium text-gray-700 dark:text-gray-300 mb-4'>
                  <MapPin className='h-4 w-4 inline mr-2' />
                  Location & Capacity
                </CardDescription>

                <motion.div
                  className='flex items-center gap-3 pl-2 border-l-2 border-primary'
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <MapPin className='h-5 w-5 text-primary' />
                  <span className='font-medium'>{event.location}</span>
                </motion.div>

                <motion.div
                  className='flex items-center gap-3 pl-2 border-l-2 border-primary'
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <Users className='h-5 w-5 text-primary' />
                  <span className='font-medium'>
                    Capacity: {event.capacity} attendees
                  </span>
                </motion.div>

                {registration && (
                  <motion.div
                    className='mt-4 flex items-center gap-3 pl-2 border-l-2 border-green-500'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <User className='h-5 w-5 text-green-500' />
                    <span className='font-medium text-green-500'>
                      You are registered
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className='pt-4 flex justify-end'
            >
              {canRegister && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleRegister}
                    disabled={registering}
                    size='lg'
                    className='px-6 shadow-md'
                  >
                    {registering ? (
                      <>
                        <Spinner size='sm' className='mr-2' /> Registering...
                      </>
                    ) : (
                      'Register for Event'
                    )}
                  </Button>
                </motion.div>
              )}

              {showCancelButton && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='destructive'
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    size='lg'
                    className='px-6 shadow-md'
                  >
                    {registering ? (
                      <>
                        <Spinner size='sm' className='mr-2' /> Cancelling...
                      </>
                    ) : (
                      'Cancel Registration'
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
