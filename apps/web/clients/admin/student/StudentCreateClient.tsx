'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import * as yup from 'yup';
import { ArrowLeftIcon, Loader2Icon, PlusIcon } from 'lucide-react';
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

const formSchema = yup.object().shape({
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
} satisfies Record<keyof FormValues, yup.Schema>);

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

export const StudentCreateClient = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => studentApi.createStudent(data),
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
      router.push(`${ROUTES.STUDENT_DETAIL}/${newStudent.id}`);
    },
    onError: (error) => {
      console.error('Error creating student:', error);
      toast.error('Failed to create student');
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    createMutation.mutate(data);
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='flex items-center mb-6'>
        <Button variant='ghost' size='icon' asChild className='mr-2'>
          <Link href={ROUTES.STUDENTS}>
            <ArrowLeftIcon className='h-4 w-4' />
          </Link>
        </Button>
        <h1 className='text-2xl font-bold'>Create New Student</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
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
                  render={({ field }) => (
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
                      <Input placeholder='Email' type='email' {...field} />
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

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
            <CardFooter className='flex justify-between'>
              <Button variant='outline' asChild>
                <Link href={ROUTES.STUDENTS}>Cancel</Link>
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                )}
                <PlusIcon className='mr-2 h-4 w-4' />
                Create Student
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};
