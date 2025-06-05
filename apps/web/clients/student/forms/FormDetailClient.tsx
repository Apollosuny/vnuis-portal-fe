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
import { getSubmissionById } from '@/api/form-submission.api';
import { getFormById } from '@/api/form.api';
import { formatDate } from '@/utils/date-utils';
import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { FormSubmissionStatus } from '@/types/enums';

export const FormDetailClient = ({ id }: { id: string }) => {
  const router = useRouter();
  const [submission, setSubmission] =
    useState<AdministrativeProceduresFormSubmission | null>(null);
  const [originalForm, setOriginalForm] =
    useState<AdministrativeProceduresForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        // Get the submission details with included form data
        const submissionData = await getSubmissionById(id);
        setSubmission(submissionData);

        // If the form is included in the response, use it
        if (submissionData.form) {
          setOriginalForm(submissionData.form);
        }
        // Otherwise, if we only have the formId, fetch the form separately
        else if (submissionData.formId) {
          const formData = await getFormById(submissionData.formId);
          setOriginalForm(formData);
        }
      } catch (err) {
        console.error('Error fetching form submission details:', err);
        setError('Failed to load submission details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [id]);

  // Helper function to get status icon
  const getStatusIcon = (status: FormSubmissionStatus) => {
    switch (status) {
      case FormSubmissionStatus.APPROVED:
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case FormSubmissionStatus.PENDING:
        return <Clock className='h-4 w-4 text-blue-500' />;
      case FormSubmissionStatus.REJECTED:
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return null;
    }
  };

  // Helper function to get human-readable status
  const getStatusText = (status: FormSubmissionStatus) => {
    switch (status) {
      case FormSubmissionStatus.APPROVED:
        return 'Approved';
      case FormSubmissionStatus.PENDING:
        return 'Under Review';
      case FormSubmissionStatus.REJECTED:
        return 'Rejected';
      case FormSubmissionStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: FormSubmissionStatus) => {
    switch (status) {
      case FormSubmissionStatus.APPROVED:
        return 'text-green-500';
      case FormSubmissionStatus.PENDING:
        return 'text-blue-500';
      case FormSubmissionStatus.REJECTED:
        return 'text-red-500';
      case FormSubmissionStatus.CANCELLED:
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Clock className='h-8 w-8 animate-spin text-primary' />
        </div>
      </StudentDashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <StudentDashboardLayout>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <XCircle className='h-12 w-12 text-red-500 mb-4' />
          <h3 className='text-lg font-medium text-gray-700'>
            {error || 'Form submission not found'}
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
          <h1 className='text-2xl font-semibold'>
            {originalForm?.name || 'Form Submission'}
          </h1>
        </div>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle>{originalForm?.name || 'Form Submission'}</CardTitle>
              <CardDescription>Submission ID: {submission.id}</CardDescription>
            </div>
            <div className='flex items-center space-x-1 px-3 py-1 rounded-full border'>
              {getStatusIcon(submission.status)}
              <span
                className={`text-sm font-medium ${getStatusColor(submission.status)}`}
              >
                {getStatusText(submission.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-medium mb-2'>Submission Details</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-gray-600'>Submitted On</span>
                      <span className='font-medium'>
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-gray-600'>Last Updated</span>
                      <span className='font-medium'>
                        {formatDate(submission.updatedAt)}
                      </span>
                    </div>
                    {submission.handleAt && (
                      <div className='flex justify-between py-2 border-b'>
                        <span className='text-gray-600'>Processed On</span>
                        <span className='font-medium'>
                          {formatDate(submission.handleAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {submission.remarks && (
                  <div>
                    <h3 className='font-medium mb-2'>Remarks</h3>
                    <p className='text-gray-700'>{submission.remarks}</p>
                  </div>
                )}
              </div>

              {/* Submission Responses */}
              {submission.result && originalForm?.data?.questions && (
                <div className='mt-6'>
                  <h3 className='font-medium mb-4'>Your Responses</h3>
                  <div className='space-y-4 border rounded-md p-4'>
                    {originalForm.data.questions.map((question, index) => {
                      const response = submission.result[question.id];
                      return (
                        <div
                          key={index}
                          className='border-b pb-3 last:border-0'
                        >
                          <p className='font-medium'>{question.title}</p>
                          {response && (
                            <div className='mt-1'>
                              {/* Handle different types of responses */}
                              {Array.isArray(response.value) ? (
                                <ul className='list-disc list-inside'>
                                  {response.value.map((val, i) => {
                                    // Find corresponding answer content if available
                                    const answerContent =
                                      question.answers?.find(
                                        (a) =>
                                          a.id.toString() === val ||
                                          a.content === val
                                      )?.content || val;
                                    return (
                                      <li key={i} className='text-gray-600'>
                                        {answerContent}
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className='text-gray-600'>
                                  {response.value}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex justify-end space-x-2'>
            {submission.status === FormSubmissionStatus.REJECTED && (
              <Button
                variant='default'
                onClick={() =>
                  router.push(
                    `/student-dashboard/forms/${originalForm?.id}/submit`
                  )
                }
              >
                Resubmit Form
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
};
