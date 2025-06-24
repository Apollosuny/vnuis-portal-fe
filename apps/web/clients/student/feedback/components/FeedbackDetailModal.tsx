'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import {
  X,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react';
import {
  Feedback,
  FeedbackStatus,
  FeedbackCategory,
  SentimentType,
} from '@/api/feedback.api';
import { DateTime } from 'luxon';

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  isOpen,
  onClose,
}) => {
  if (!feedback) return null;

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

  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy HH:mm');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <div className='flex items-center justify-between'>
                <DialogTitle className='flex items-center space-x-2'>
                  <MessageSquare className='h-5 w-5' />
                  <span>Feedback Details</span>
                </DialogTitle>
                <Button variant='ghost' size='sm' onClick={onClose}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </DialogHeader>

            <div className='space-y-6'>
              {/* Title and Rating */}
              <div>
                <h2 className='text-xl font-semibold mb-2'>{feedback.title}</h2>
                {feedback.rating && (
                  <div className='flex items-center space-x-2'>
                    <div className='flex space-x-1'>
                      {renderStars(feedback.rating)}
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {feedback.rating} out of 5 stars
                    </span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className='flex flex-wrap gap-2'>
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
                  <Badge className={getSentimentColor(feedback.sentiment)}>
                    {feedback.sentiment}
                  </Badge>
                )}
                {feedback.confidence && (
                  <Badge variant='outline'>
                    Confidence: {(feedback.confidence * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div>
                <h3 className='font-medium mb-2'>Content</h3>
                <div className='bg-muted/50 rounded-lg p-4'>
                  <p className='text-sm whitespace-pre-wrap'>
                    {feedback.content}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              {feedback.keywords && feedback.keywords.length > 0 && (
                <div>
                  <h3 className='font-medium mb-2'>Keywords</h3>
                  <div className='flex flex-wrap gap-2'>
                    {feedback.keywords.map((keyword, index) => (
                      <Badge key={index} variant='secondary'>
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>Submitted</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatDate(feedback.createdAt)}
                    </p>
                  </div>
                </div>
                {feedback.reviewedAt && (
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>Reviewed</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatDate(feedback.reviewedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Responses */}
              {feedback.responses && feedback.responses.length > 0 && (
                <div>
                  <Separator className='my-4' />
                  <h3 className='font-medium mb-3'>
                    Responses ({feedback.responses.length})
                  </h3>
                  <div className='space-y-4'>
                    {feedback.responses
                      .filter((response) => !response.isInternal) // Only show public responses
                      .map((response, index) => (
                        <motion.div
                          key={response.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className='bg-muted/30 rounded-lg p-4'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <div className='flex items-center space-x-2'>
                              <User className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm font-medium'>
                                {response.operator?.firstName}{' '}
                                {response.operator?.lastName}
                              </span>
                            </div>
                            <span className='text-xs text-muted-foreground'>
                              {formatDate(response.createdAt)}
                            </span>
                          </div>
                          <p className='text-sm'>{response.content}</p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {feedback.aiAnalysis && (
                <div>
                  <Separator className='my-4' />
                  <h3 className='font-medium mb-2'>AI Analysis</h3>
                  <div className='bg-blue-50 rounded-lg p-4'>
                    <pre className='text-xs text-blue-800 whitespace-pre-wrap'>
                      {JSON.stringify(feedback.aiAnalysis, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
