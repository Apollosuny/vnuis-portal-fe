'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Star, Send, Loader2 } from 'lucide-react';
import { useCreateFeedback } from '@/hooks/useFeedback';
import { FeedbackCategory, CreateFeedbackDto } from '@/api/feedback.api';

const schema = yup
  .object({
    title: yup
      .string()
      .required('Title is required')
      .min(5, 'Title must be at least 5 characters'),
    content: yup
      .string()
      .required('Content is required')
      .min(20, 'Content must be at least 20 characters'),
    category: yup.string().required('Category is required'),
    rating: yup.number().min(1).max(5).optional(),
  })
  .required();

type FormData = {
  title: string;
  content: string;
  category: string;
  rating?: number;
};

interface CreateFeedbackFormProps {
  onSuccess?: () => void;
}

export const CreateFeedbackForm: React.FC<CreateFeedbackFormProps> = ({
  onSuccess,
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const { mutate: createFeedback, isPending } = useCreateFeedback();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
  });

  const watchedCategory = watch('category');

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case FeedbackCategory.GENERAL:
        return 'General feedback about the system or platform';
      case FeedbackCategory.USER_EXPERIENCE:
        return 'Feedback about user interface and experience';
      case FeedbackCategory.FUNCTIONALITY:
        return 'Feedback about specific features and functions';
      case FeedbackCategory.PERFORMANCE:
        return 'Feedback about system performance and speed';
      case FeedbackCategory.DESIGN:
        return 'Feedback about visual design and layout';
      case FeedbackCategory.CONTENT:
        return 'Feedback about content quality and relevance';
      case FeedbackCategory.TECHNICAL_ISSUE:
        return 'Report technical problems or bugs';
      case FeedbackCategory.SUGGESTION:
        return 'Suggestions for improvements or new features';
      case FeedbackCategory.COMPLAINT:
        return 'Report issues or express concerns';
      case FeedbackCategory.COMPLIMENT:
        return 'Share positive feedback and appreciation';
      default:
        return 'Select a category to see description';
    }
  };

  const onSubmit = (data: FormData) => {
    const feedbackData: CreateFeedbackDto = {
      title: data.title,
      content: data.content,
      category: data.category as FeedbackCategory,
      rating: selectedRating || undefined,
    };

    createFeedback(feedbackData, {
      onSuccess: () => {
        reset();
        setSelectedRating(null);
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <motion.button
        key={index}
        type='button'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setSelectedRating(index + 1);
          setValue('rating', index + 1);
        }}
        className={`p-1 transition-colors ${
          selectedRating && index < selectedRating
            ? 'text-yellow-400'
            : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        <Star className='h-6 w-6 fill-current' />
      </motion.button>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Send className='h-5 w-5' />
            <span>Submit New Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Title */}
            <div className='space-y-2'>
              <Label htmlFor='title'>Title *</Label>
              <Input
                id='title'
                placeholder='Brief title for your feedback'
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-sm text-red-500'
                >
                  {errors.title.message}
                </motion.p>
              )}
            </div>

            {/* Category */}
            <div className='space-y-2'>
              <Label htmlFor='category'>Category *</Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                defaultValue={watchedCategory}
              >
                <SelectTrigger
                  className={errors.category ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FeedbackCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {watchedCategory && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='text-sm text-muted-foreground'
                >
                  {getCategoryDescription(watchedCategory)}
                </motion.p>
              )}
              {errors.category && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-sm text-red-500'
                >
                  {errors.category.message}
                </motion.p>
              )}
            </div>

            {/* Rating (Optional) */}
            <div className='space-y-2'>
              <Label>Rating (Optional)</Label>
              <div className='flex items-center space-x-2'>
                {renderStars()}
                {selectedRating && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-sm text-muted-foreground ml-2'
                  >
                    {selectedRating} star{selectedRating > 1 ? 's' : ''}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className='space-y-2'>
              <Label htmlFor='content'>Content *</Label>
              <Textarea
                id='content'
                placeholder='Please provide detailed feedback about your experience...'
                rows={6}
                {...register('content')}
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='text-sm text-red-500'
                >
                  {errors.content.message}
                </motion.p>
              )}
              <p className='text-xs text-muted-foreground'>
                Minimum 20 characters required
              </p>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type='submit'
                disabled={!isValid || isPending}
                className='w-full'
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    Submit Feedback
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
