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

export const useFormEdit = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);
  const [isSlugEditable, setIsSlugEditable] = useState(false);
  const [isSlugUnique, setIsSlugUnique] = useState(true);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [originalSlug, setOriginalSlug] = useState<string>();

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

  // Check if slug is unique
  useEffect(() => {
    // Skip validation during initial load
    if (isInitialLoad) {
      return;
    }

    const validateSlug = async () => {
      // Only check uniqueness if:
      // 1. We have a slug value
      // 2. And the slug has changed from its original value (if editing)
      if (
        debouncedSlug &&
        debouncedSlug.length > 0 &&
        debouncedSlug !== originalSlug
      ) {
        try {
          setIsCheckingSlug(true);
          const isUnique = await checkSlugUnique(
            debouncedSlug,
            params.id as string
          );
          setIsSlugUnique(isUnique);
          if (!isUnique) {
            toast.error(
              'This slug is already in use. Please choose a different one.'
            );
          }
        } catch (error) {
          console.error('Error checking slug uniqueness:', error);
        } finally {
          setIsCheckingSlug(false);
        }
      } else if (debouncedSlug === originalSlug) {
        // If the slug matches the original value, it's always valid
        setIsSlugUnique(true);
      }
    };

    validateSlug();
  }, [debouncedSlug, params.id, isInitialLoad, originalSlug]);

  // Generate slug from name
  useEffect(() => {
    if (formName && !isSlugEditable) {
      const generatedSlug = slugify(formName);
      // Ensure we never set undefined or null value
      setValue('slug', generatedSlug || '');
    }
  }, [formName, isSlugEditable, setValue]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        setIsInitialLoad(true); // Ensure we're in initial load state while fetching

        const formData = await getFormById(params.id as string);
        setForm(formData);

        console.log('Loaded form data:', formData);

        // Make a copy of the data to avoid any reference issues
        const formDataCopy = JSON.parse(JSON.stringify(formData));

        // Ensure slug has a value before reset
        formDataCopy.slug = formDataCopy.slug || '';

        // Reset the form with the copied data
        reset(formDataCopy);

        // Force the slug value to be set explicitly (with a small delay to ensure DOM is updated)
        setTimeout(() => {
          setValue('slug', formDataCopy.slug);
          console.log('Explicitly set slug to:', formDataCopy.slug);
        }, 50);

        // Save the original slug for comparison
        setOriginalSlug(formData.slug || '');

        // After successful load, set isInitialLoad to false
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 100);
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Failed to fetch form data');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchForm();
    }
  }, [params.id, reset]);

  const handleUpdateForm = async (data: any) => {
    try {
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

      setIsLoading(true);
      await updateForm(params.id as string, data);
      toast.success('Form updated successfully');
      router.push(ROUTES.FORMS);
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    } finally {
      setIsLoading(false);
    }
  };

  // Make slug editable if needed
  const handleMakeSlugEditable = () => {
    setIsSlugEditable(true);
    // Store current slug as original if user starts editing to avoid unnecessary validation
    if (!originalSlug && formSlug) {
      setOriginalSlug(formSlug);
    }
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
