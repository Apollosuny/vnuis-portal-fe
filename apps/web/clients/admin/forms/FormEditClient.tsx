'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { Button } from '@workspace/ui/components/button';
import { Trash as TrashIcon, Save as SaveIcon } from 'lucide-react';
import { ArrowLeft, PlusIcon, Loader2 } from 'lucide-react';

import { Question } from '@/types/administrative-form.types';
import { ROUTES } from '@/constants/router';
import { useFormEdit } from '@/hooks/useFormEdit';

export const FormEditClient = () => {
  const router = useRouter();
  const {
    control,
    errors,
    isLoading,
    handleSubmit,
    watch,
    setValue,
    getValues,
    shouldDisableButton,
    handleUpdateForm,
    questionCount,
    setQuestionCount,
    form,
    isSlugEditable,
    handleMakeSlugEditable,
    isCheckingSlug,
    isSlugUnique,
    isInitialLoad,
  } = useFormEdit();

  const formData = watch('data');
  const watchedSlug = watch('slug');

  // Debug log to see the current form values
  useEffect(() => {
    console.log('Current slug value:', watchedSlug);
    console.log('Form data:', getValues());
    console.log('Loading state:', isLoading);
    console.log('Initial load state:', isInitialLoad);
  }, [watchedSlug, getValues, isLoading, isInitialLoad]);

  useEffect(() => {
    if (form && form.data.questions) {
      setQuestionCount(form.data.questions.length);
    }
  }, [form, setQuestionCount]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  const addQuestion = () => {
    const currentQuestions = getValues('data.questions') || [];
    const newQuestion = {
      id: currentQuestions.length + 1,
      title: '',
      type: 'text',
      answers: [] as { id: number; type: string; content: string }[],
    };

    setValue('data.questions', [...currentQuestions, newQuestion]);
    setQuestionCount((prev) => prev + 1);
  };

  const removeQuestion = (index: number) => {
    const formData = getValues('data.questions') || [];
    const updatedQuestions = formData
      .filter((_, i) => i !== index)
      .map((q, i) => {
        // Ensure answers is always an array
        const answers = Array.isArray(q.answers) ? q.answers : [];
        return {
          id: i + 1, // Reindex
          title: q.title || '',
          type: q.type || 'text',
          answers: answers.map((a) => ({
            id: a.id,
            type: a.type || 'option',
            content: a.content || '',
          })),
        } as Question;
      });

    setValue('data.questions', updatedQuestions);
    setQuestionCount((prev) => prev - 1);
  };

  const addAnswer = (questionIndex: number) => {
    const currentQuestions = getValues('data.questions') || [];
    const currentAnswers = currentQuestions[questionIndex]?.answers || [];

    const newAnswer = {
      id: currentAnswers.length + 1,
      type: 'option',
      content: '',
    };

    const updatedQuestions = [...currentQuestions];
    if (updatedQuestions[questionIndex]) {
      const question = updatedQuestions[questionIndex];
      updatedQuestions[questionIndex] = {
        id: question.id,
        title: question.title ?? '',
        type: question.type ?? 'text',
        answers: [...currentAnswers, newAnswer],
      };

      setValue('data.questions', updatedQuestions);
    }
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const currentQuestions = getValues('data.questions') || [];
    if (!currentQuestions[questionIndex]) return;

    const question = currentQuestions[questionIndex];
    const answers = Array.isArray(question.answers) ? question.answers : [];
    const updatedAnswers = answers
      .filter((_, i) => i !== answerIndex)
      .map((a, i) => ({
        id: i + 1, // Reindex
        type: a.type || 'option',
        content: a.content || '',
      }));

    const updatedQuestions = [...currentQuestions];
    updatedQuestions[questionIndex] = {
      id: question.id,
      title: question.title || '',
      type: question.type || 'text',
      answers: updatedAnswers,
    } as Question;

    setValue('data.questions', updatedQuestions);
  };

  const onSubmit = (data: any) => {
    handleUpdateForm(data);
  };

  const questionTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Dropdown Select' },
  ];

  const formTypes = [
    { value: 'PROCEDURES', label: 'Administrative Procedure' },
    { value: 'REQUEST', label: 'Request Form' },
    { value: 'FEEDBACK', label: 'Feedback Form' },
    { value: 'SURVEY', label: 'Survey Form' },
  ];

  return (
    <div className='space-y-4 md:space-y-6'>
      {/* Mobile Title */}
      <div className='block md:hidden mb-4'>
        <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Edit Form
        </h1>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          Update form information and questions
        </p>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='flex items-center gap-2 w-full sm:w-auto'
        >
          <ArrowLeft className='h-4 w-4' />
          <span className='hidden sm:inline'>Back</span>
          <span className='sm:hidden'>Back</span>
        </Button>
      </div>

      <div className='bg-background rounded-xl shadow-lg p-4 md:p-8 border border-border'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-6 md:space-y-8'
        >
          {/* Form Basic Information */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium mb-1 text-foreground'
                >
                  Form Name *
                </label>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id='name'
                        type='text'
                        className='w-full bg-background border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                        placeholder='Enter form name'
                      />
                      {errors.name && (
                        <p className='text-destructive text-sm mt-1'>
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor='slug'
                  className='block text-sm font-medium mb-1 text-foreground'
                >
                  Slug *{' '}
                  <span className='text-xs text-muted-foreground'>
                    (auto-generated from name)
                  </span>
                </label>
                <Controller
                  name='slug'
                  control={control}
                  render={({ field }) => (
                    <div className='relative'>
                      <input
                        id='slug'
                        type='text'
                        disabled={true}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className='w-full bg-muted border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors opacity-70 cursor-not-allowed'
                        placeholder='Auto-generated from form name'
                        readOnly={true}
                      />
                      {isCheckingSlug && (
                        <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                        </div>
                      )}
                      {errors.slug && (
                        <p className='text-destructive text-sm mt-1'>
                          {errors.slug.message}
                        </p>
                      )}
                      {!errors.slug &&
                        !isSlugUnique &&
                        field.value !== undefined &&
                        field.value !== null &&
                        field.value !== '' &&
                        !isLoading &&
                        !isInitialLoad && (
                          <p className='text-destructive text-sm mt-1'>
                            This slug is already in use
                          </p>
                        )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium mb-1 text-foreground'
                >
                  Description *
                </label>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <textarea
                        {...field}
                        id='description'
                        rows={3}
                        className='w-full bg-background border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                        placeholder='Enter form description'
                      />
                      {errors.description && (
                        <p className='text-destructive text-sm mt-1'>
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='type'
                  className='block text-sm font-medium mb-1 text-foreground'
                >
                  Form Type *
                </label>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <select
                        {...field}
                        id='type'
                        className='w-full bg-background border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                      >
                        <option value=''>Select Form Type</option>
                        {formTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className='text-destructive text-sm mt-1'>
                          {errors.type.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor='fileUrl'
                  className='block text-sm font-medium mb-1 text-foreground'
                >
                  File URL (Optional)
                </label>
                <Controller
                  name='fileUrl'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id='fileUrl'
                        type='text'
                        value={field.value ?? ''}
                        className='w-full bg-background border border-input text-foreground rounded-md p-2 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                        placeholder='Enter file URL if applicable'
                      />
                    </div>
                  )}
                />
              </div>

              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <Controller
                    name='isActive'
                    control={control}
                    render={({ field }) => (
                      <input
                        type='checkbox'
                        id='isActive'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2'
                      />
                    )}
                  />
                  <label htmlFor='isActive' className='text-sm text-foreground'>
                    Active
                  </label>
                </div>

                <div className='flex items-center gap-2'>
                  <Controller
                    name='allowEditAfterSubmit'
                    control={control}
                    render={({ field }) => (
                      <input
                        type='checkbox'
                        id='allowEditAfterSubmit'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2'
                      />
                    )}
                  />
                  <label
                    htmlFor='allowEditAfterSubmit'
                    className='text-sm text-foreground'
                  >
                    Allow Edit After Submit
                  </label>
                </div>

                <div className='flex items-center gap-2'>
                  <Controller
                    name='requireApproval'
                    control={control}
                    render={({ field }) => (
                      <input
                        type='checkbox'
                        id='requireApproval'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 text-primary bg-background border-input rounded focus:ring-ring focus:ring-2'
                      />
                    )}
                  />
                  <label
                    htmlFor='requireApproval'
                    className='text-sm text-foreground'
                  >
                    Require Approval
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Questions Section */}
          <div className='mt-8'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold text-foreground'>
                Form Questions
              </h2>
              <Button
                type='button'
                variant='outline'
                onClick={addQuestion}
                className='flex items-center gap-2 text-sm'
              >
                <PlusIcon className='h-4 w-4' />
                Add Question
              </Button>
            </div>

            {/* Questions */}
            {Array.from({ length: questionCount }).map((_, index) => (
              <div
                key={index}
                className='bg-background border border-border rounded-lg p-6 mb-4'
              >
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-semibold text-foreground'>
                    Question {index + 1}
                  </h3>
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={() => removeQuestion(index)}
                    size='sm'
                    className='text-sm'
                  >
                    <TrashIcon className='h-4 w-4' />
                    Remove
                  </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor={`question-title-${index}`}
                      className='block text-sm font-medium mb-2 text-foreground'
                    >
                      Question Text *
                    </label>
                    <Controller
                      name={`data.questions.${index}.title`}
                      control={control}
                      defaultValue=''
                      render={({ field }) => (
                        <input
                          {...field}
                          id={`question-title-${index}`}
                          type='text'
                          className='w-full bg-background border border-input text-foreground rounded-md p-3 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                          placeholder='Enter question'
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`question-type-${index}`}
                      className='block text-sm font-medium mb-2 text-foreground'
                    >
                      Question Type *
                    </label>
                    <Controller
                      name={`data.questions.${index}.type`}
                      control={control}
                      defaultValue='text'
                      render={({ field }) => (
                        <select
                          {...field}
                          id={`question-type-${index}`}
                          className='w-full bg-background border border-input text-foreground rounded-md p-3 focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                          onChange={(e) => {
                            field.onChange(e);
                            if (
                              e.target.value === 'text' ||
                              e.target.value === 'textarea'
                            ) {
                              const currentQuestions =
                                getValues('data.questions') || [];
                              if (currentQuestions[index]) {
                                const question = currentQuestions[index];
                                const updatedQuestions = [...currentQuestions];
                                updatedQuestions[index] = {
                                  id: question.id,
                                  title: question.title,
                                  type: e.target.value,
                                  answers: [],
                                };
                                setValue('data.questions', updatedQuestions);
                              }
                            }
                          }}
                        >
                          {questionTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                </div>

                {/* Answers for multiple choice questions */}
                <Controller
                  name={`data.questions.${index}.type`}
                  control={control}
                  render={({ field }) => {
                    const questionType = field.value;

                    if (
                      questionType === 'multiple-choice' ||
                      questionType === 'checkbox' ||
                      questionType === 'select'
                    ) {
                      return (
                        <div className='mt-6'>
                          <div className='flex justify-between items-center mb-3'>
                            <h4 className='text-sm font-medium text-foreground'>
                              Answer Options
                            </h4>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => addAnswer(index)}
                              size='sm'
                              className='text-xs'
                            >
                              <PlusIcon className='h-3 w-3 mr-1' />
                              Add Option
                            </Button>
                          </div>

                          <Controller
                            name={`data.questions.${index}.answers`}
                            control={control}
                            defaultValue={[]}
                            render={({ field: answersField }) => (
                              <div className='space-y-3'>
                                {(answersField.value || []).map(
                                  (answer: any, answerIndex: number) => (
                                    <div
                                      key={answerIndex}
                                      className='flex items-center gap-3'
                                    >
                                      <Controller
                                        name={`data.questions.${index}.answers.${answerIndex}.content`}
                                        control={control}
                                        defaultValue=''
                                        render={({ field: contentField }) => (
                                          <input
                                            {...contentField}
                                            type='text'
                                            className='w-full bg-background border border-input text-foreground rounded-md p-2 text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-colors'
                                            placeholder={`Option ${answerIndex + 1}`}
                                          />
                                        )}
                                      />
                                      <Button
                                        type='button'
                                        variant='ghost'
                                        onClick={() =>
                                          removeAnswer(index, answerIndex)
                                        }
                                        size='sm'
                                        className='h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors'
                                      >
                                        <TrashIcon className='h-4 w-4' />
                                      </Button>
                                    </div>
                                  )
                                )}

                                {(answersField.value || []).length === 0 && (
                                  <p className='text-sm text-muted-foreground italic'>
                                    Add answer options for this question.
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      );
                    }

                    return <></>;
                  }}
                />
              </div>
            ))}

            {questionCount === 0 && (
              <div className='bg-background border border-border rounded-lg p-8 text-center'>
                <p className='text-muted-foreground'>
                  No questions added yet. Click the "Add Question" button to add
                  your first question.
                </p>
              </div>
            )}
          </div>

          <div className='flex justify-end mt-8'>
            <Button
              type='submit'
              disabled={shouldDisableButton}
              className='flex items-center gap-2'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-background'></div>
                  Loading...
                </>
              ) : (
                <>
                  <SaveIcon className='h-4 w-4' />
                  Update Form
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
