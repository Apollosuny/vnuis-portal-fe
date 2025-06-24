'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination';
import { Search, Filter, Eye, MessageSquare, Clock, Star } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAdminFeedbacks } from '@/hooks/useAdminFeedbacks';

const ITEMS_PER_PAGE = 10;

export function FeedbackList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sentiment, setSentiment] = useState('');

  const {
    data: feedbacks,
    isLoading,
    error,
  } = useAdminFeedbacks({
    page,
    limit: ITEMS_PER_PAGE,
    search,
    category,
    status,
    sentiment,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800';
      case 'NEUTRAL':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).toFormat('MMM dd, yyyy HH:mm');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>Loading feedbacks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-red-600'>
            Error loading feedbacks: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback List</CardTitle>
        <CardDescription>
          Manage and review student feedback submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Search feedbacks...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All Categories</SelectItem>
              <SelectItem value='GENERAL'>General</SelectItem>
              <SelectItem value='USER_EXPERIENCE'>User Experience</SelectItem>
              <SelectItem value='FUNCTIONALITY'>Functionality</SelectItem>
              <SelectItem value='PERFORMANCE'>Performance</SelectItem>
              <SelectItem value='DESIGN'>Design</SelectItem>
              <SelectItem value='CONTENT'>Content</SelectItem>
              <SelectItem value='TECHNICAL_ISSUE'>Technical Issue</SelectItem>
              <SelectItem value='SUGGESTION'>Suggestion</SelectItem>
              <SelectItem value='COMPLAINT'>Complaint</SelectItem>
              <SelectItem value='COMPLIMENT'>Compliment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All Status</SelectItem>
              <SelectItem value='SUBMITTED'>Submitted</SelectItem>
              <SelectItem value='UNDER_REVIEW'>Under Review</SelectItem>
              <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
              <SelectItem value='RESOLVED'>Resolved</SelectItem>
              <SelectItem value='CLOSED'>Closed</SelectItem>
              <SelectItem value='REJECTED'>Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Sentiment' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All Sentiment</SelectItem>
              <SelectItem value='POSITIVE'>Positive</SelectItem>
              <SelectItem value='NEGATIVE'>Negative</SelectItem>
              <SelectItem value='NEUTRAL'>Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks?.map((feedback) => (
                <TableRow key={feedback.id} className='hover:bg-gray-50'>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{feedback.title}</div>
                      <div className='text-sm text-gray-500 truncate max-w-xs'>
                        {feedback.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      {feedback.student?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{feedback.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {feedback.sentiment && (
                      <Badge className={getSentimentColor(feedback.sentiment)}>
                        {feedback.sentiment}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {feedback.rating ? (
                      <div className='flex items-center'>
                        <Star className='h-4 w-4 text-yellow-400 mr-1' />
                        <span>{feedback.rating}/5</span>
                      </div>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      {formatDate(feedback.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      <Button variant='ghost' size='sm'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm'>
                        <MessageSquare className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between mt-6'>
          <div className='text-sm text-gray-500'>
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(page * ITEMS_PER_PAGE, feedbacks?.length || 0)} of{' '}
            {feedbacks?.length || 0} results
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={
                    page <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(page + 1)}
                  className={
                    feedbacks && feedbacks.length < ITEMS_PER_PAGE
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
