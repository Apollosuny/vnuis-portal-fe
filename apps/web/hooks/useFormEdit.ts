import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { formSchema } from '@/lib/validations/form';
import { useParams, useRouter } from 'next/navigation';
import { getFormById, updateForm, checkSlugUnique } from '@/api/form.api';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { ROUTES } from '@/constants/router';
import { toast } from 'sonner';
import { slugify } from '@/utils/slugify';
import { useDebounce } from './useDebounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useFormEdit = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [isSlugUnique, setIsSlugUnique] = useState(true);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [originalSlug, setOriginalSlug] = useState<string>();
  // Slug should never be editable
  const isSlugEditable = false;

  type FormValues = yup.InferType<typeof formSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(formSchema) as any, // Type assertion to bypass the type mismatch
    defaultValues: {
      name: '',
      slug: '', // This will be overridden when form data is loaded
      description: '',
      type: '',
      fileUrl: '',
      isActive: true,
      allowEditAfterSubmit: false,
      requireApproval: false,
      data: {
        questions: [],
      },
    },
    mode: 'onChange', // This will validate on change
  }); // Watch form name for automatic slug generation
  const formName = watch('name');
  const formSlug = watch('slug');

  // Debug log when form slug changes
  useEffect(() => {
    console.log('Form slug changed:', formSlug);
  }, [formSlug]);

  // Debounce slug to avoid frequent API calls
  const debouncedSlug = useDebounce(formSlug || '', 500);

  // Use React Query to check slug uniqueness
  const {
    isLoading: isSlugQueryLoading,
    data: isUnique,
    error: slugError,
  } = useQuery({
    queryKey: ['slug-check', debouncedSlug, params.id],
    queryFn: async () => {
      if (!debouncedSlug || debouncedSlug.length === 0) {
        return true; // No slug to validate
      }

      if (debouncedSlug === originalSlug) {
        return true; // If slug is the original value, it's valid
      }

      return await checkSlugUnique(debouncedSlug, params.id as string);
    },
    enabled:
      !isInitialLoad && !!debouncedSlug && debouncedSlug !== originalSlug,
  });

  // Handle slug uniqueness result
  useEffect(() => {
    if (isUnique !== undefined) {
      setIsSlugUnique(!!isUnique);
      if (!isUnique) {
        toast.error(
          'This slug is already in use. Please choose a different one.'
        );
      }
    }
  }, [isUnique]);

  // Handle slug error
  useEffect(() => {
    if (slugError) {
      console.error('Error checking slug uniqueness:', slugError);
    }
  }, [slugError]);

  // Update isCheckingSlug based on query loading state
  useEffect(() => {
    setIsCheckingSlug(isSlugQueryLoading);
  }, [isSlugQueryLoading]);

  // Generate slug from name - always auto-generate regardless of isSlugEditable
  useEffect(() => {
    if (formName) {
      const generatedSlug = slugify(formName);
      // Ensure we never set undefined or null value
      setValue('slug', generatedSlug || '');
    }
  }, [formName, setValue]);

  // Use React Query to fetch form data
  const { data: formData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['form', params.id],
    queryFn: async () => {
      if (!params.id) return null;
      return await getFormById(params.id as string);
    },
    enabled: !!params.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle form data when it changes
  useEffect(() => {
    if (!formData) return;

    setIsInitialLoad(true);
    setForm(formData);
    console.log('Loaded form data:', formData);

    // Make a copy of the data to avoid any reference issues
    const formDataCopy = JSON.parse(JSON.stringify(formData));

    // Ensure slug has a value before reset
    formDataCopy.slug = formDataCopy.slug || '';

    // Reset the form with the copied data
    reset(formDataCopy);

    // Set the form name first, then let the slug be auto-generated
    setTimeout(() => {
      // The slug will be auto-generated from the name via our effect
      console.log('Form name loaded, slug will be auto-generated');
    }, 50);

    // Save the original slug for comparison
    setOriginalSlug(formData.slug || '');

    // After successful load, set isInitialLoad to false
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }, [formData, reset]);

  // Update isLoading state based on query loading state
  useEffect(() => {
    setIsLoading(isQueryLoading);
  }, [isQueryLoading]);

  // Use React Query mutation for form updates
  const queryClient = useQueryClient();
  const updateFormMutation = useMutation({
    mutationFn: (data: any) => updateForm(params.id as string, data),
    onSuccess: () => {
      toast.success('Form updated successfully');
      queryClient.invalidateQueries({ queryKey: ['form'] });
      router.push(ROUTES.FORMS);
    },
    onError: (error: Error) => {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    },
  });

  const handleUpdateForm = async (data: any) => {
    // Ensure slug has a value before updating
    if (!data.slug) {
      toast.error('Form slug is required');
      return;
    }

    // Check if slug is unique before updating
    if (!isSlugUnique) {
      toast.error('Cannot update form with a slug that is already in use');
      return;
    }

    updateFormMutation.mutate(data);
  };

  // This function now does nothing as slug should never be editable
  const handleMakeSlugEditable = () => {
    // No-op function - slug is never editable
    toast.info(
      'Slug is automatically generated from form name and cannot be edited manually'
    );
  };

  const shouldDisableButton = isLoading || !isSlugUnique;

  return {
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
  };
};
