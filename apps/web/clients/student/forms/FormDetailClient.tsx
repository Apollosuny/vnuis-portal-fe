'use client';

import { useEffect, useState } from 'react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFormById } from '@/api/form.api';
import { formatDate } from '@/utils/date-utils';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';

export const FormDetailClient = ({ id }: { id: string }) => {
  const router = useRouter();
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formData = await getFormById(id);
        setForm(formData);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Clock className='h-8 w-8 animate-spin text-primary' />
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error || !form) {
    return (
      <StudentDashboardLayout>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <XCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-medium text-gray-700'>
            {error || 'Form not found'}
          </h3>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className='space-y-6'>
        <div className='flex items-center mb-6'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mr-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
          <h1 className='text-2xl font-semibold'>{form.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            <CardDescription>Form ID: {form.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-medium mb-2'>Form Details</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-gray-600'>Status</span>
                      <span className='font-medium'>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-gray-600'>Created At</span>
                      <span className='font-medium'>
                        {formatDate(form.createdAt)}
                      </span>
                    </div>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-gray-600'>Last Updated</span>
                      <span className='font-medium'>
                        {formatDate(form.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='font-medium mb-2'>Description</h3>
                  <p className='text-gray-700'>{form.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-end space-x-2'>
            <Button
              variant='default'
              onClick={() =>
                router.push(`/student-dashboard/forms/\${form.id}/submit`)
              }
            >
              Submit Form
            </Button>
          </CardFooter>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
};
