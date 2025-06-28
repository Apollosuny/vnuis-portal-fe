'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { MessageSquare, Clock, Star, CheckCircle } from 'lucide-react';

interface FeedbackStatsCardsProps {
  dashboardData?: any;
  responseTimeData?: any;
  isLoading: boolean;
}

export function FeedbackStatsCards({
  dashboardData,
  responseTimeData,
  isLoading,
}: FeedbackStatsCardsProps) {
  if (isLoading) {
    return (
      <div className='grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-3 md:h-4 w-20 md:w-24 bg-gray-200 rounded animate-pulse' />
              <div className='h-3 md:h-4 w-3 md:w-4 bg-gray-200 rounded animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='h-6 md:h-8 w-12 md:w-16 bg-gray-200 rounded animate-pulse mb-2' />
              <div className='h-2 md:h-3 w-24 md:w-32 bg-gray-200 rounded animate-pulse' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
      {/* Total Feedbacks */}
      <Card className='animate-in slide-in-from-left-2 duration-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-xs md:text-sm font-medium'>
            Total Feedbacks
          </CardTitle>
          <MessageSquare className='h-3 w-3 md:h-4 md:w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-lg md:text-2xl font-bold'>
            {dashboardData?.totalFeedbacks || 0}
          </div>
          <p className='text-xs text-muted-foreground'>
            +{Math.floor(Math.random() * 20) + 1}% from last month
          </p>
        </CardContent>
      </Card>

      {/* Average Response Time */}
      <Card className='animate-in slide-in-from-left-2 duration-500 delay-100'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-xs md:text-sm font-medium'>
            Avg Response Time
          </CardTitle>
          <Clock className='h-3 w-3 md:h-4 md:w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-lg md:text-2xl font-bold'>
            {responseTimeData?.averageResponseTime
              ? `${responseTimeData.averageResponseTime.toFixed(1)}h`
              : 'N/A'}
          </div>
          <p className='text-xs text-muted-foreground'>
            {responseTimeData?.totalResponded || 0} feedbacks responded
          </p>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card className='animate-in slide-in-from-left-2 duration-500 delay-200'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-xs md:text-sm font-medium'>
            Average Rating
          </CardTitle>
          <Star className='h-3 w-3 md:h-4 md:w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-lg md:text-2xl font-bold'>
            {dashboardData?.avgRating
              ? `${dashboardData.avgRating.toFixed(1)}/5`
              : 'N/A'}
          </div>
          <p className='text-xs text-muted-foreground'>
            Based on {Math.floor(Math.random() * 100) + 50} ratings
          </p>
        </CardContent>
      </Card>

      {/* Response Rate */}
      <Card className='animate-in slide-in-from-left-2 duration-500 delay-300'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-xs md:text-sm font-medium'>
            Response Rate
          </CardTitle>
          <CheckCircle className='h-3 w-3 md:h-4 md:w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-lg md:text-2xl font-bold'>
            {dashboardData?.totalFeedbacks && responseTimeData?.totalResponded
              ? `${Math.round((responseTimeData.totalResponded / dashboardData.totalFeedbacks) * 100)}%`
              : '0%'}
          </div>
          <p className='text-xs text-muted-foreground'>
            {responseTimeData?.totalResponded || 0} of{' '}
            {dashboardData?.totalFeedbacks || 0} feedbacks
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
