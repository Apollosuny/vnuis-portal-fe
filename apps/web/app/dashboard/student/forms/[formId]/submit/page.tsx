'use client';

import { useEffect, useState } from 'react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';
import { getFormById } from '@/api/form.api';
import { submitForm } from '@/api/form-submission.api';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { SubmitFormValues } from '@/types/form-submission.types';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormSubmissionStatus } from '@/types/enums';

export default function FormSubmitPage({
  params,
}: {
  params: { formId: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, Record<string, any>>>(
    {}
  );

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formData = await getFormById(params.formId);
        setForm(formData);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Could not load the form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [params.formId]);

  const handleSubmit = async () => {
    if (!form) return;

    setSubmitting(true);
    try {
      const submitData: SubmitFormValues = {
        result: formData,
      };

      await submitForm(form.id, submitData);

      // Navigate back to forms list after successful submission
      router.push('/dashboard/student/forms?submitted=true');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Could not submit the form. Please try again later.');
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    questionId: string,
    answerId: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [answerId]: value,
      },
    }));
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className='flex flex-col items-center justify-center py-12'>
          <Loader2 className='h-12 w-12 text-primary animate-spin mb-4' />
          <h3 className='text-lg font-medium text-gray-700'>Loading form...</h3>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error) {
    return (
      <StudentDashboardLayout>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='bg-red-50 p-4 rounded-md max-w-md w-full'>
            <h3 className='text-lg font-medium text-red-800 mb-2'>Error</h3>
            <p className='text-red-700'>{error}</p>
            <Button
              variant='outline'
              onClick={() => router.push('/dashboard/student/forms')}
              className='mt-4'
            >
              <ArrowLeftRight className='mr-2 h-4 w-4' /> Back to Forms
            </Button>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (!form) {
    return (
      <StudentDashboardLayout>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='bg-yellow-50 p-4 rounded-md max-w-md w-full'>
            <h3 className='text-lg font-medium text-yellow-800 mb-2'>
              Form Not Found
            </h3>
            <p className='text-yellow-700'>
              The requested form could not be found.
            </p>
            <Button
              variant='outline'
              onClick={() => router.push('/dashboard/student/forms')}
              className='mt-4'
            >
              <ArrowLeftRight className='mr-2 h-4 w-4' /> Back to Forms
            </Button>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-semibold'>{form.name}</h1>
          <Button
            variant='outline'
            onClick={() => router.push('/dashboard/student/forms')}
          >
            <ArrowLeftRight className='mr-2 h-4 w-4' /> Back to Forms
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {/* This is a placeholder for the actual form rendering */}
              <div className='bg-yellow-50 p-4 rounded-md'>
                <h3 className='text-lg font-medium text-yellow-800 mb-2'>
                  Form Content
                </h3>
                <p className='text-yellow-700'>
                  This is a placeholder for the actual form content. In a real
                  implementation, the form would be rendered based on the
                  form.data structure.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => router.push('/dashboard/student/forms')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Submit Form'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
