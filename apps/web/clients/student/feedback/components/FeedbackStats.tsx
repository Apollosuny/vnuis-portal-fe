'use client';

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
} from 'lucide-react';
import { Feedback, FeedbackStatus, SentimentType } from '@/api/feedback.api';
import { DateTime } from 'luxon';

interface FeedbackStatsProps {
  feedbacks: Feedback[];
}

export const FeedbackStats: React.FC<FeedbackStatsProps> = ({ feedbacks }) => {
  const totalFeedbacks = feedbacks.length;
  const pendingFeedbacks = feedbacks.filter(
    (f) =>
      f.status === FeedbackStatus.SUBMITTED ||
      f.status === FeedbackStatus.UNDER_REVIEW
  ).length;
  const resolvedFeedbacks = feedbacks.filter(
    (f) =>
      f.status === FeedbackStatus.RESOLVED || f.status === FeedbackStatus.CLOSED
  ).length;
  const avgRating =
    feedbacks
      .filter((f) => f.rating)
      .reduce((acc, f) => acc + (f.rating || 0), 0) /
      feedbacks.filter((f) => f.rating).length || 0;

  const positiveFeedbacks = feedbacks.filter(
    (f) => f.sentiment === SentimentType.POSITIVE
  ).length;
  const negativeFeedbacks = feedbacks.filter(
    (f) => f.sentiment === SentimentType.NEGATIVE
  ).length;
  const neutralFeedbacks = feedbacks.filter(
    (f) => f.sentiment === SentimentType.NEUTRAL
  ).length;

  const stats = [
    {
      title: 'Total Feedback',
      value: totalFeedbacks,
      icon: <MessageSquare className='h-4 w-4 text-blue-500' />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Review',
      value: pendingFeedbacks,
      icon: <Clock className='h-4 w-4 text-yellow-500' />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Resolved',
      value: resolvedFeedbacks,
      icon: <CheckCircle className='h-4 w-4 text-green-500' />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Average Rating',
      value: avgRating > 0 ? avgRating.toFixed(1) : '0',
      icon: <Star className='h-4 w-4 text-purple-500' />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const sentimentStats = [
    {
      label: 'Positive',
      value: positiveFeedbacks,
      percentage:
        totalFeedbacks > 0
          ? ((positiveFeedbacks / totalFeedbacks) * 100).toFixed(1)
          : '0',
      color: 'bg-green-500',
    },
    {
      label: 'Neutral',
      value: neutralFeedbacks,
      percentage:
        totalFeedbacks > 0
          ? ((neutralFeedbacks / totalFeedbacks) * 100).toFixed(1)
          : '0',
      color: 'bg-gray-500',
    },
    {
      label: 'Negative',
      value: negativeFeedbacks,
      percentage:
        totalFeedbacks > 0
          ? ((negativeFeedbacks / totalFeedbacks) * 100).toFixed(1)
          : '0',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Main Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className='overflow-hidden'>
              <CardHeader className='pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0'>
                <CardTitle className='text-sm font-medium'>
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent className='px-4 pb-4'>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {stat.title === 'Average Rating'
                    ? 'out of 5 stars'
                    : 'total submissions'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sentiment Analysis */}
      {totalFeedbacks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {sentimentStats.map((item, index) => (
                  <div
                    key={item.label}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-2'>
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className='text-sm font-medium'>{item.label}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm text-muted-foreground'>
                        {item.value} ({item.percentage}%)
                      </span>
                      <div className='w-24 bg-gray-200 rounded-full h-2'>
                        <motion.div
                          className={`h-2 rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
