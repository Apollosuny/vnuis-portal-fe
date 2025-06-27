'use client';

import { useEffect, useState } from 'react';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Pencil } from 'lucide-react';
import { ROUTES } from '@/constants/router';
import { getFormById } from '@/api/form.api';

export const FormDetailClient = () => {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formData = await getFormById(params.id as string);
        setForm(formData);
      } catch (error) {
        console.error('Error fetching form:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchForm();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>Form not found</p>
      </div>
    );
  }

  return (
    <div className='space-y-4 md:space-y-6'>
      {/* Mobile Title */}
      <div className='block md:hidden mb-4'>
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Form Details
        </h1>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          View form information and questions
        </p>
      </div>

      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <Button
          variant='ghost'
          onClick={() => router.push(ROUTES.FORMS)}
          className='flex items-center gap-2 w-full sm:w-auto'
        >
          <ArrowLeft className='h-4 w-4' />
          <span className='hidden sm:inline'>Back to Forms</span>
          <span className='sm:hidden'>Back</span>
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/forms/${params.id}/edit`)}
          className='flex items-center justify-center gap-2 w-full sm:w-auto'
        >
          <Pencil className='h-4 w-4' />
          <span className='hidden sm:inline'>Edit Form</span>
          <span className='sm:hidden'>Edit</span>
        </Button>
      </div>

      <div className='bg-background rounded-xl shadow-lg p-4 md:p-8 border border-border'>
        <div className='space-y-4 md:space-y-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-foreground break-words'>
              {form.name}
            </h1>
            <p className='text-muted-foreground mt-2 text-sm md:text-base'>
              {form.description}
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Form Type
              </h3>
              <p className='mt-1 text-foreground'>{form.type}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Slug
              </h3>
              <p className='mt-1 text-foreground'>{form.slug}</p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Status
              </h3>
              <p className='mt-1'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    form.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <div>
              <h3 className='text-sm font-medium text-muted-foreground'>
                Settings
              </h3>
              <div className='mt-1 space-y-1'>
                <p className='text-xs md:text-sm text-foreground'>
                  {form.allowEditAfterSubmit ? '✓' : '✗'} Allow Edit After
                  Submit
                </p>
                <p className='text-xs md:text-sm text-foreground'>
                  {form.requireApproval ? '✓' : '✗'} Require Approval
                </p>
              </div>
            </div>
          </div>

          <div className='mt-6 md:mt-8'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>
              Questions
            </h2>
            <div className='space-y-4 md:space-y-6'>
              {form.data.questions.map((question, index) => (
                <div
                  key={question.id}
                  className='bg-background border border-border rounded-lg p-4 md:p-6'
                >
                  <div className='space-y-3 md:space-y-4'>
                    <div>
                      <span className='text-xs md:text-sm text-muted-foreground'>
                        Question {index + 1}
                      </span>
                      <h3 className='text-foreground font-medium mt-1 text-sm md:text-base break-words'>
                        {question.title}
                      </h3>
                    </div>
                    <div>
                      <span className='text-sm text-muted-foreground'>
                        Type
                      </span>
                      <p className='text-foreground mt-1 capitalize'>
                        {question.type}
                      </p>
                    </div>
                    {['multiple-choice', 'checkbox', 'select'].includes(
                      question.type
                    ) && (
                      <div>
                        <span className='text-sm text-muted-foreground'>
                          Options
                        </span>
                        <ul className='mt-2 space-y-2'>
                          {question.answers &&
                            question.answers.map((answer, answerIndex) => (
                              <li key={answer.id} className='text-foreground'>
                                {answerIndex + 1}. {answer.content}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
