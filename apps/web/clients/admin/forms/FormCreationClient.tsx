'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, SaveIcon, ArrowLeft } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useFormCreation } from '@/hooks/useFormCreation';
import { Button } from '@workspace/ui/components/button';
import { Question, Answer } from '@/types/administrative-form.types';
import { useRouter } from 'next/navigation';

export const FormCreationClient = () => {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(1);

  const {
    control,
    errors,
    isLoading,
    handleSubmit,
    watch,
    setValue,
    getValues,
    shouldDisableButton,
    handleCreateForm,
  } = useFormCreation();

  const formData = watch('data');

  const addQuestion = () => {
    const currentQuestions = getValues('data.questions') || [];
    const newQuestion: Question = {
      id: currentQuestions.length + 1,
      title: '',
      type: 'text',
      answers: [],
    };

    setValue('data.questions', [...currentQuestions, newQuestion]);
    setQuestionCount((prev) => prev + 1);
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = getValues('data.questions') || [];
    // Create a properly typed array of Question objects
    const updatedQuestions = currentQuestions
      .filter((_, i) => i !== index)
      .map((q, i) => {
        return {
          id: i + 1, // Reindex
          title: q.title,
          type: q.type,
          answers: q.answers,
        };
      });

    setValue('data.questions', updatedQuestions);
    setQuestionCount((prev) => prev - 1);
  };

  const addAnswer = (questionIndex: number) => {
    const currentQuestions = getValues('data.questions') || [];
    const currentAnswers = currentQuestions[questionIndex]?.answers || [];

    const newAnswer: Answer = {
      id: currentAnswers.length + 1,
      type: 'option',
      content: '',
    };

    const updatedQuestions = [...currentQuestions];
    if (updatedQuestions[questionIndex]) {
      const question = updatedQuestions[questionIndex];
      // Ensure all required properties are present and have proper types
      updatedQuestions[questionIndex] = {
        id: question.id, // id is already required by the schema
        title: question.title ?? '', // Use nullish coalescing to provide default value
        type: question.type ?? 'text', // Use nullish coalescing to provide default value
        answers: [...currentAnswers, newAnswer],
      };

      setValue('data.questions', updatedQuestions);
    }
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const currentQuestions = getValues('data.questions') || [];

    if (currentQuestions[questionIndex]) {
      const question = currentQuestions[questionIndex];
      const currentAnswers = question.answers;
      const updatedAnswers = currentAnswers
        .filter((_, i) => i !== answerIndex)
        .map((a, i) => ({ ...a, id: i + 1 })); // Reindex

      const updatedQuestions = [...currentQuestions];
      // Explicitly create a valid Question object
      updatedQuestions[questionIndex] = {
        id: question.id,
        title: question.title,
        type: question.type,
        answers: updatedAnswers,
      };

      setValue('data.questions', updatedQuestions);
    }
  };

  const onSubmit = (data: any) => {
    handleCreateForm(data);
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
    <div className='space-y-6'>
      {/* Back button */}
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          onClick={() => router.push('/dashboard/forms')}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Forms
        </Button>
      </div>

      <div className='bg-card rounded-xl shadow-lg p-8 border'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          {/* Form Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium mb-1 text-gray-300'
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
                        className='w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                        placeholder='Enter form name'
                      />
                      {errors.name && (
                        <p className='text-red-400 text-sm mt-1'>
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
                  className='block text-sm font-medium mb-1 text-gray-300'
                >
                  Slug *
                </label>
                <Controller
                  name='slug'
                  control={control}
                  render={({ field }) => (
                    <div>
                      <input
                        {...field}
                        id='slug'
                        type='text'
                        className='w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                        placeholder='Enter form slug (URL-friendly identifier)'
                      />
                      {errors.slug && (
                        <p className='text-red-400 text-sm mt-1'>
                          {errors.slug.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium mb-1 text-gray-300'
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
                        className='w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                        placeholder='Enter form description'
                      />
                      {errors.description && (
                        <p className='text-red-400 text-sm mt-1'>
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
                  className='block text-sm font-medium mb-1 text-gray-300'
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
                        className='w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                      >
                        <option value=''>Select Form Type</option>
                        {formTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className='text-red-400 text-sm mt-1'>
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
                  className='block text-sm font-medium mb-1 text-gray-300'
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
                        className='w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                        placeholder='Enter file URL if applicable'
                      />
                      {errors.fileUrl && (
                        <p className='text-red-400 text-sm mt-1'>
                          {errors.fileUrl.message}
                        </p>
                      )}
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
                        className='h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2'
                      />
                    )}
                  />
                  <label htmlFor='isActive' className='text-sm text-gray-300'>
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
                        className='h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2'
                      />
                    )}
                  />
                  <label
                    htmlFor='allowEditAfterSubmit'
                    className='text-sm text-gray-300'
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
                        className='h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2'
                      />
                    )}
                  />
                  <label
                    htmlFor='requireApproval'
                    className='text-sm text-gray-300'
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
              <h2 className='text-xl font-semibold text-white'>
                Form Questions
              </h2>
              <Button
                type='button'
                variant='outline'
                onClick={addQuestion}
                className='flex items-center gap-2 text-sm bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors'
              >
                <PlusIcon className='h-4 w-4' />
                Add Question
              </Button>
            </div>

            {/* Questions */}
            {Array.from({ length: questionCount }).map((_, index) => (
              <div
                key={index}
                className='bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4'
              >
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-semibold text-white'>
                    Question {index + 1}
                  </h3>
                  <Button
                    type='button'
                    variant='destructive'
                    onClick={() => removeQuestion(index)}
                    className='text-sm bg-red-600 hover:bg-red-700 text-white border-red-600'
                    size='sm'
                  >
                    <TrashIcon className='h-4 w-4' />
                    Remove
                  </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor={`question-title-${index}`}
                      className='block text-sm font-medium mb-2 text-gray-300'
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
                          className='w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                          placeholder='Enter question'
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`question-type-${index}`}
                      className='block text-sm font-medium mb-2 text-gray-300'
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
                          className='w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                          onChange={(e) => {
                            field.onChange(e);
                            // Reset answers if changing to a type that doesn't use them
                            if (
                              e.target.value === 'text' ||
                              e.target.value === 'textarea'
                            ) {
                              const currentQuestions =
                                getValues('data.questions') || [];
                              if (currentQuestions[index]) {
                                const question = currentQuestions[index];
                                const updatedQuestions = [...currentQuestions];
                                // Create a valid Question object with the required properties
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
                            <h4 className='text-sm font-medium text-gray-300'>
                              Answer Options
                            </h4>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => addAnswer(index)}
                              size='sm'
                              className='text-xs bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors'
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
                                  (answer, answerIndex) => (
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
                                            className='w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
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
                                        className='h-8 w-8 p-0 hover:bg-red-600 hover:text-white transition-colors'
                                      >
                                        <TrashIcon className='h-4 w-4 text-red-400 hover:text-white' />
                                      </Button>
                                    </div>
                                  )
                                )}

                                {(answersField.value || []).length === 0 && (
                                  <p className='text-sm text-gray-400 italic'>
                                    Add answer options for this question.
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      );
                    }

                    // Return empty fragment instead of null to keep TypeScript happy
                    return <></>;
                  }}
                />
              </div>
            ))}

            {questionCount === 0 && (
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-8 text-center'>
                <p className='text-gray-400'>
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
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Loading...
                </>
              ) : (
                <>
                  <SaveIcon className='h-4 w-4' />
                  Save Form
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
