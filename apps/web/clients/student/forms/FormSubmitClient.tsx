'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFormById } from '@/api/form.api';
import { formatDate } from '@/utils/date-utils';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { submitForm } from '@/api/form-submission.api';
import { FormSubmissionResult } from '@/types/form-submission.types';

export const FormSubmitClient = ({ id }: { id: string }) => {
  const router = useRouter();
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;

    // Collect form data
    const formData = new FormData(e.currentTarget);
    const formValues: Record<string, any> = {};

    // Process form data into a structured object
    if (form.data && form.data.questions) {
      form.data.questions.forEach((question, qIndex) => {
        const questionId = question.id || qIndex;

        if (question.type === 'checkbox' && question.answers) {
          // For radio buttons (single selection), get the selected value
          const selectedValue = formData.get(
            `question-${question.id || qIndex}`
          );
          if (selectedValue) {
            // Format as expected by backend for single selection
            formValues[questionId] = { value: selectedValue };
          }
        } else if (question.type === 'multiple-choice' && question.answers) {
          // For checkboxes (multiple selections), collect multiple selected values
          const checkedValues: string[] = [];
          question.answers.forEach((answer, aIndex) => {
            const checkboxName = `question-${question.id || qIndex}-${answer.id || aIndex}`;
            if (formData.get(checkboxName)) {
              checkedValues.push(
                answer.id?.toString() || answer.content || aIndex.toString()
              );
            }
          });
          if (checkedValues.length > 0) {
            formValues[questionId] = { value: checkedValues };
          }
        } else {
          // For text inputs, textareas, and select dropdowns
          const value = formData.get(`question-${question.id || qIndex}`);
          if (value) {
            // Format as expected by backend for text/textarea/select
            formValues[questionId] = { value };
          }
        }
      });
    }

    setSubmitting(true);
    try {
      if (Object.keys(formValues).length === 0) {
        throw new Error('Vui lòng điền vào ít nhất một trường trước khi gửi');
      }

      await submitForm(form.id, {
        result: formValues,
      });

      // Navigate back to forms list on success
      router.push('/student-dashboard/forms?tab=my-forms');
    } catch (err: any) {
      console.error('Error submitting form:', err);

      const errorMessage =
        err.response?.data?.message ||
        'Failed to submit form. Please try again later.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
          <h1 className='text-2xl font-semibold'>Submit {form.name}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>{form.name}</CardTitle>
              <CardDescription>
                Please fill out all required fields below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {form && form.data && form.data.questions ? (
                  form.data.questions.map((question, qIndex) => (
                    <div key={question.id || qIndex} className='mb-6'>
                      <label className='block text-sm font-medium mb-2'>
                        {question.title}
                      </label>

                      {question.type === 'text' && (
                        <input
                          type='text'
                          name={`question-${question.id || qIndex}`}
                          className='w-full p-2 border rounded-md'
                          placeholder={`Enter ${question.title.toLowerCase()}`}
                          required
                        />
                      )}

                      {question.type === 'number' && (
                        <input
                          type='number'
                          name={`question-${question.id || qIndex}`}
                          className='w-full p-2 border rounded-md'
                          placeholder={`Enter ${question.title.toLowerCase()}`}
                          required
                        />
                      )}

                      {question.type === 'textarea' && (
                        <textarea
                          name={`question-${question.id || qIndex}`}
                          className='w-full p-2 border rounded-md min-h-[100px]'
                          placeholder={`Enter ${question.title.toLowerCase()}`}
                          required
                        />
                      )}

                      {question.type === 'multiple-choice' &&
                        question.answers && (
                          <div className='space-y-2'>
                            {question.answers.map((answer, aIndex) => (
                              <div
                                key={answer.id || aIndex}
                                className='flex items-center'
                              >
                                <input
                                  type='checkbox'
                                  name={`question-${question.id || qIndex}-${answer.id || aIndex}`}
                                  id={`checkbox-${question.id || qIndex}-${answer.id || aIndex}`}
                                  value={
                                    answer.id ||
                                    answer.content ||
                                    aIndex.toString()
                                  }
                                  className='mr-2'
                                />
                                <label
                                  htmlFor={`checkbox-${question.id || qIndex}-${answer.id || aIndex}`}
                                >
                                  {answer.content}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                      {question.type === 'checkbox' && question.answers && (
                        <div className='space-y-2'>
                          {question.answers.map((answer, aIndex) => (
                            <div
                              key={answer.id || aIndex}
                              className='flex items-center'
                            >
                              <input
                                type='radio'
                                name={`question-${question.id || qIndex}`}
                                id={`answer-${answer.id || aIndex}`}
                                value={
                                  answer.id ||
                                  answer.content ||
                                  aIndex.toString()
                                }
                                className='mr-2'
                              />
                              <label htmlFor={`answer-${answer.id || aIndex}`}>
                                {answer.content}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'select' && question.answers && (
                        <select
                          name={`question-${question.id || qIndex}`}
                          className='w-full p-2 border rounded-md'
                          required
                        >
                          <option value=''>-- Select an option --</option>
                          {question.answers.map((answer, aIndex) => (
                            <option
                              key={answer.id || aIndex}
                              value={
                                answer.id || answer.content || aIndex.toString()
                              }
                            >
                              {answer.content}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
                    <p className='text-yellow-800'>
                      This form doesn't have any questions configured. Please
                      contact support.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className='flex justify-between'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting ? (
                  <>
                    <Clock className='mr-2 h-4 w-4 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </StudentDashboardLayout>
  );
};
