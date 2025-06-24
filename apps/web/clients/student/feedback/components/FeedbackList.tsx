'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  Feedback,
  FeedbackStatus,
  FeedbackCategory,
  SentimentType,
} from '@/api/feedback.api';
import { DateTime } from 'luxon';
import { useDeleteFeedback } from '@/hooks/useFeedback';
import { FeedbackDetailModal } from './FeedbackDetailModal';

interface FeedbackListProps {
  feedbacks: Feedback[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  isLoading,
  onRefresh,
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { mutate: deleteFeedback, isPending: isDeleting } = useDeleteFeedback();

  const getStatusIcon = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.SUBMITTED:
      case FeedbackStatus.UNDER_REVIEW:
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case FeedbackStatus.IN_PROGRESS:
        return <AlertCircle className='h-4 w-4 text-blue-500' />;
      case FeedbackStatus.RESOLVED:
      case FeedbackStatus.CLOSED:
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case FeedbackStatus.REJECTED:
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      default:
        return <MessageSquare className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.SUBMITTED:
      case FeedbackStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case FeedbackStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case FeedbackStatus.RESOLVED:
      case FeedbackStatus.CLOSED:
        return 'bg-green-100 text-green-800';
      case FeedbackStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: FeedbackCategory) => {
    switch (category) {
      case FeedbackCategory.GENERAL:
        return 'bg-gray-100 text-gray-800';
      case FeedbackCategory.USER_EXPERIENCE:
        return 'bg-purple-100 text-purple-800';
      case FeedbackCategory.FUNCTIONALITY:
        return 'bg-blue-100 text-blue-800';
      case FeedbackCategory.PERFORMANCE:
        return 'bg-orange-100 text-orange-800';
      case FeedbackCategory.DESIGN:
        return 'bg-pink-100 text-pink-800';
      case FeedbackCategory.CONTENT:
        return 'bg-indigo-100 text-indigo-800';
      case FeedbackCategory.TECHNICAL_ISSUE:
        return 'bg-red-100 text-red-800';
      case FeedbackCategory.SUGGESTION:
        return 'bg-green-100 text-green-800';
      case FeedbackCategory.COMPLAINT:
        return 'bg-red-100 text-red-800';
      case FeedbackCategory.COMPLIMENT:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment?: SentimentType) => {
    switch (sentiment) {
      case SentimentType.POSITIVE:
        return 'bg-green-100 text-green-800';
      case SentimentType.NEGATIVE:
        return 'bg-red-100 text-red-800';
      case SentimentType.NEUTRAL:
        return 'bg-gray-100 text-gray-800';
      case SentimentType.MIXED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsDetailOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      deleteFeedback(id);
    }
  };

  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy HH:mm');
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-muted-foreground'>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center py-12'
      >
        <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
        <h3 className='text-lg font-semibold mb-2'>No feedback yet</h3>
        <p className='text-muted-foreground mb-4'>
          You haven't submitted any feedback yet. Start by sharing your
          thoughts!
        </p>
        <Button onClick={onRefresh} variant='outline'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Refresh
        </Button>
      </motion.div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>
          Your Feedback ({feedbacks.length})
        </h2>
        <Button onClick={onRefresh} variant='outline' size='sm'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Refresh
        </Button>
      </div>

      {/* Feedback Items */}
      <div className='space-y-4'>
        <AnimatePresence>
          {feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <CardTitle className='text-lg'>
                          {feedback.title}
                        </CardTitle>
                        {feedback.rating && (
                          <div className='flex items-center space-x-1'>
                            <Star className='h-4 w-4 text-yellow-400 fill-current' />
                            <span className='text-sm text-muted-foreground'>
                              {feedback.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className='flex flex-wrap gap-2 mb-2'>
                        <Badge className={getCategoryColor(feedback.category)}>
                          {feedback.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(feedback.status)}>
                          <div className='flex items-center space-x-1'>
                            {getStatusIcon(feedback.status)}
                            <span>{feedback.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        {feedback.sentiment && (
                          <Badge
                            className={getSentimentColor(feedback.sentiment)}
                          >
                            {feedback.sentiment}
                          </Badge>
                        )}
                      </div>

                      <p className='text-sm text-muted-foreground'>
                        Submitted on {formatDate(feedback.createdAt)}
                      </p>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewDetail(feedback)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(feedback.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='pt-0'>
                  <p className='text-sm text-muted-foreground line-clamp-3'>
                    {feedback.content}
                  </p>

                  {feedback.responses && feedback.responses.length > 0 && (
                    <div className='mt-3 pt-3 border-t'>
                      <p className='text-xs text-muted-foreground'>
                        {feedback.responses.length} response
                        {feedback.responses.length > 1 ? 's' : ''} received
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedFeedback(null);
        }}
      />
    </div>
  );
};
