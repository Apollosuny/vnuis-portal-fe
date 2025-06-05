import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { formSchema } from '@/lib/validations/form';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getFormById, updateForm } from '@/api/form.api';
import { AdministrativeProceduresForm } from '@/types/administrative-form.types';
import { ROUTES } from '@/constants/router';
import { toast } from 'sonner';

export const useFormEdit = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [form, setForm] = useState<AdministrativeProceduresForm | null>(null);

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
      slug: '',
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
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        const formData = await getFormById(params.id as string);
        setForm(formData);
        reset(formData);
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

  const shouldDisableButton = isLoading;

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
  };
};
