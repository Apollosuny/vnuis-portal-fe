'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import * as yup from 'yup';
import { DateTime } from 'luxon';
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { studentApi } from '@/api/student.api';
import { ROUTES } from '@/constants/router';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  studentId: yup.string().required('Student ID is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: yup.string().optional(),
  major: yup.string().required('Major is required'),
  enrollYear: yup
    .number()
    .integer()
    .positive('Please enter a valid year')
    .required('Enroll year is required'),
  dob: yup.string().required('Date of birth is required'),
  address: yup.string().optional(),
});

type FormValues = {
  firstName: string;
  lastName: string;
  studentId: string;
  email: string;
  phone?: string;
  major: string;
  enrollYear: number;
  dob: string;
  address?: string;
};

export const StudentEditClient = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentApi.getStudentById(studentId),
    enabled: !!studentId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => studentApi.updateStudent(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
      router.push(`${ROUTES.STUDENT_DETAIL}/${studentId}`);
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error('Failed to update student information');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      studentId: '',
      email: '',
      phone: '',
      major: '',
      enrollYear: new Date().getFullYear(),
      dob: '',
      address: '',
    },
  });

  // Update form when student data is loaded
  useEffect(() => {
    if (student) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        email: student.email,
        phone: student.phone || '',
        major: student.major,
        enrollYear: student.enrollYear,
        dob: DateTime.fromISO(student.dob).toFormat('yyyy-MM-dd'),
        address: student.address || '',
      });
    }
  }, [student, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-4 px-4 md:py-6'>
      {/* Mobile Header */}
      <div className='sm:hidden mb-6'>
        <div className='flex items-center mb-3'>
          <Button variant='ghost' size='icon' asChild className='mr-2'>
            <Link href={`${ROUTES.STUDENT_DETAIL}/${studentId}`}>
              <ArrowLeftIcon className='h-4 w-4' />
            </Link>
          </Button>
          <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
            Edit Student
          </h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className='hidden sm:flex items-center mb-6'>
        <Button variant='ghost' size='icon' asChild className='mr-2'>
          <Link href={`${ROUTES.STUDENT_DETAIL}/${studentId}`}>
            <ArrowLeftIcon className='h-4 w-4' />
          </Link>
        </Button>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
          Edit Student
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg sm:text-xl text-gray-900 dark:text-gray-100'>
            Student Information
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<FormValues, 'firstName'>;
                  }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='First name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lastName'
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<FormValues, 'lastName'>;
                  }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='studentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder='Student ID' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='Phone number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='major'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major</FormLabel>
                      <FormControl>
                        <Input placeholder='Major' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='enrollYear'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Year</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='dob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className='flex flex-col sm:flex-row gap-3 sm:justify-between'>
              <Button
                variant='outline'
                asChild
                className='w-full sm:w-auto order-2 sm:order-1'
              >
                <Link href={`${ROUTES.STUDENT_DETAIL}/${studentId}`}>
                  Cancel
                </Link>
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full sm:w-auto order-1 sm:order-2'
              >
                {isSubmitting && (
                  <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                )}
                <SaveIcon className='mr-2 h-4 w-4' />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
