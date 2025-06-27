'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  Loader2Icon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/date-utils';
import { studentApi } from '@/api/student.api';
import { ROUTES } from '@/constants/router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { Separator } from '@workspace/ui/components/separator';

export const StudentDetailClient = () => {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentApi.getStudentById(studentId),
    enabled: !!studentId,
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await studentApi.deleteStudent(studentId);
      router.push(ROUTES.STUDENTS);
    } catch (error) {
      console.error('Failed to delete student:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!student) {
    return (
      <div className='text-center py-10'>
        <p className='text-lg text-gray-500'>Student not found</p>
        <Button asChild className='mt-4'>
          <Link href={ROUTES.STUDENTS}>Back to Students</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='flex items-center mb-6'>
        <Button variant='ghost' size='icon' asChild className='mr-2'>
          <Link href={ROUTES.STUDENTS}>
            <ArrowLeftIcon className='h-4 w-4' />
          </Link>
        </Button>
        <h1 className='text-2xl font-bold'>Student Details</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='md:col-span-1'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 relative'>
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className='w-32 h-32 rounded-full object-cover'
                />
              ) : (
                <div className='w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 mx-auto'>
                  {student.firstName.charAt(0)}
                  {student.lastName.charAt(0)}
                </div>
              )}
            </div>
            <CardTitle>
              {student.firstName} {student.lastName}
            </CardTitle>
            <div className='text-sm text-gray-500 mt-1'>
              #{student.studentId}
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <MailIcon className='h-4 w-4 mr-2 text-gray-500' />
                <span>{student.email}</span>
              </div>

              {student.phone && (
                <div className='flex items-center'>
                  <PhoneIcon className='h-4 w-4 mr-2 text-gray-500' />
                  <span>{student.phone}</span>
                </div>
              )}

              <div className='flex items-center'>
                <BookOpenIcon className='h-4 w-4 mr-2 text-gray-500' />
                <span>{student.major}</span>
              </div>

              <div className='flex items-center'>
                <CalendarIcon className='h-4 w-4 mr-2 text-gray-500' />
                <span>Enrolled: {student.enrollYear}</span>
              </div>

              <div className='flex items-center'>
                <CalendarIcon className='h-4 w-4 mr-2 text-gray-500' />
                <span>DOB: {formatDate(student.dob, 'dd MMM yyyy')}</span>
              </div>

              {student.address && (
                <div className='flex items-start'>
                  <MapPinIcon className='h-4 w-4 mr-2 text-gray-500 mt-0.5' />
                  <span>{student.address}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' asChild>
              <Link href={`${ROUTES.STUDENT_DETAIL}/${studentId}/edit`}>
                <PencilIcon className='h-4 w-4 mr-2' />
                Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>
                  <TrashIcon className='h-4 w-4 mr-2' />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the student
                    {student
                      ? ` ${student.firstName} ${student.lastName}`
                      : ''}{' '}
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        <div className='md:col-span-2'>
          <Tabs defaultValue='academic'>
            <TabsList className='mb-4'>
              <TabsTrigger value='academic'>Academic Info</TabsTrigger>
              <TabsTrigger value='activities'>Activities</TabsTrigger>
              <TabsTrigger value='forms'>Forms</TabsTrigger>
            </TabsList>

            <TabsContent value='academic'>
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-medium'>Major</h3>
                      <p className='text-gray-600'>{student.major}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className='font-medium'>Year of Enrollment</h3>
                      <p className='text-gray-600'>{student.enrollYear}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className='font-medium'>Current Status</h3>
                      <p className='text-gray-600'>Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='activities'>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-500 text-center py-8'>
                    No recent activities found
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='forms'>
              <Card>
                <CardHeader>
                  <CardTitle>Forms Submitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-500 text-center py-8'>
                    No forms submitted yet
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
