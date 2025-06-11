'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreateFormValues } from '@/types/administrative-form.types';
import { createForm } from '@/api/form.api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';
import { useQueryClient } from '@tanstack/react-query';
import { slugify } from '@/utils/slugify';

// Create a validation schema for the form
const schema = yup.object().shape({
  name: yup.string().required('Form name is required'),
  slug: yup
    .string()
    .required('Slug is required')
    .matches(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers and hyphens'
    ),
  description: yup.string().required('Description is required'),
  type: yup.string().required('Form type is required'),
  isActive: yup.boolean().default(true),
  fileUrl: yup.string().optional().nullable(), // Make it optional AND nullable to match CreateFormValues
  allowEditAfterSubmit: yup.boolean().default(false),
  requireApproval: yup.boolean().default(false),
  data: yup.object({
    questions: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.number().required(),
          title: yup.string().required('Question title is required'),
          type: yup.string().required('Question type is required'),
          answers: yup
            .array()
            .of(
              yup.object().shape({
                id: yup.number().required(),
                type: yup.string().required(),
                content: yup.string().required('Answer content is required'),
              })
            )
            .when('type', {
              is: (val: string) =>
                ['multiple-choice', 'checkbox', 'select'].includes(val),
              then: (schema) =>
                schema.min(1, 'At least one answer option is required'),
              otherwise: (schema) => schema,
            }),
        })
      )
      .min(1, 'At least one question is required'),
  }),
});

// Default form values
const defaultValues: CreateFormValues = {
  name: '',
  slug: '',
  description: '',
  type: '',
  isActive: true,
  fileUrl: '',
  allowEditAfterSubmit: false,
  requireApproval: false,
  data: {
    questions: [
      {
        id: 1,
        title: '',
        type: 'text',
        answers: [],
      },
    ],
  },
};

export const useFormCreation = (onSuccess?: (form: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<CreateFormValues>({
    resolver: yupResolver(schema) as any, // Cast as any to avoid type issues
    defaultValues,
    mode: 'onChange',
  });

  // Watch the form name to generate slug
  const formName = watch('name');

  // Auto-generate slug from form name
  useEffect(() => {
    if (formName) {
      const generatedSlug = slugify(formName);
      setValue('slug', generatedSlug);
    }
  }, [formName, setValue]);

  const shouldDisableButton = useMemo(
    () => !isDirty || !isValid || isLoading,
    [isDirty, isValid, isLoading]
  );

  const handleCreateForm = async (formData: CreateFormValues) => {
    try {
      setIsLoading(true);

      // Prepare form data
      // Add IDs to the questions and answers if they are missing
      const preparedData = {
        ...formData,
        data: {
          questions: formData.data.questions.map((q, i) => ({
            ...q,
            id: q.id || i + 1,
            answers: q.answers.map((a, j) => ({
              ...a,
              id: a.id || j + 1,
              type: a.type || 'option',
            })),
          })),
        },
      };

      // Submit the form
      const response = await createForm(preparedData);
      toast.success('Form created successfully');

      // Reset form
      reset();

      // Invalidate the forms query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['forms'] });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response);
      } else {
        // Navigate to forms list
        router.push(ROUTES.FORMS);
      }
    } catch (error: any) {
      console.error('Error creating form:', error);
      toast.error(error.response?.data?.message || 'Failed to create form');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    errors,
    isLoading,
    shouldDisableButton,
    handleSubmit,
    handleCreateForm,
    watch,
    setValue,
    getValues,
    reset,
  };
};
