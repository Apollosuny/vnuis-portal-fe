'use client';

import { useState } from 'react';

import { Search, Filter, X, Calendar } from 'lucide-react';
import { DateTime } from 'luxon';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Button } from '@workspace/ui/components/button';

interface FeedbackFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export function FeedbackFilters({ onFiltersChange }: FeedbackFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    applyFilters({
      search: value,
      category,
      status,
      sentiment,
      startDate,
      endDate,
    });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    applyFilters({
      search,
      category: value,
      status,
      sentiment,
      startDate,
      endDate,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    applyFilters({
      search,
      category,
      status: value,
      sentiment,
      startDate,
      endDate,
    });
  };

  const handleSentimentChange = (value: string) => {
    setSentiment(value);
    applyFilters({
      search,
      category,
      status,
      sentiment: value,
      startDate,
      endDate,
    });
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    applyFilters({
      search,
      category,
      status,
      sentiment,
      startDate: value,
      endDate,
    });
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    applyFilters({
      search,
      category,
      status,
      sentiment,
      startDate,
      endDate: value,
    });
  };

  const applyFilters = (filters: any) => {
    // Chuyển đổi giá trị "all" thành giá trị rỗng cho API
    const apiFilters = {
      ...filters,
      category: filters.category === 'all' ? '' : filters.category,
      status: filters.status === 'all' ? '' : filters.status,
      sentiment: filters.sentiment === 'all' ? '' : filters.sentiment,
    };
    onFiltersChange(apiFilters);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setSentiment('all');
    setStartDate('');
    setEndDate('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    search ||
    category !== 'all' ||
    status !== 'all' ||
    sentiment !== 'all' ||
    startDate ||
    endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Filter className='h-5 w-5' />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant='secondary' className='ml-2'>
              Active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Filter feedbacks by various criteria</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Search</label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Search feedbacks...'
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {/* Category Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Category</label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
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
          </div>

          {/* Status Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='SUBMITTED'>Submitted</SelectItem>
                <SelectItem value='UNDER_REVIEW'>Under Review</SelectItem>
                <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                <SelectItem value='RESOLVED'>Resolved</SelectItem>
                <SelectItem value='CLOSED'>Closed</SelectItem>
                <SelectItem value='REJECTED'>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sentiment Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Sentiment</label>
            <Select value={sentiment} onValueChange={handleSentimentChange}>
              <SelectTrigger>
                <SelectValue placeholder='All Sentiment' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Sentiment</SelectItem>
                <SelectItem value='POSITIVE'>Positive</SelectItem>
                <SelectItem value='NEGATIVE'>Negative</SelectItem>
                <SelectItem value='NEUTRAL'>Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className='space-y-2'>
          <label className='text-sm font-medium flex items-center space-x-2'>
            <Calendar className='h-4 w-4' />
            <span>Date Range</span>
          </label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Input
                type='date'
                placeholder='Start Date'
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div>
              <Input
                type='date'
                placeholder='End Date'
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const end = DateTime.now();
              const start = end.minus({ days: 7 });
              setStartDate(start.toISODate() || '');
              setEndDate(end.toISODate() || '');
              applyFilters({
                search,
                category,
                status,
                sentiment,
                startDate: start.toISODate(),
                endDate: end.toISODate(),
              });
            }}
          >
            Last 7 days
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const end = DateTime.now();
              const start = end.minus({ days: 30 });
              setStartDate(start.toISODate() || '');
              setEndDate(end.toISODate() || '');
              applyFilters({
                search,
                category,
                status,
                sentiment,
                startDate: start.toISODate(),
                endDate: end.toISODate(),
              });
            }}
          >
            Last 30 days
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const end = DateTime.now();
              const start = end.minus({ days: 90 });
              setStartDate(start.toISODate() || '');
              setEndDate(end.toISODate() || '');
              applyFilters({
                search,
                category,
                status,
                sentiment,
                startDate: start.toISODate(),
                endDate: end.toISODate(),
              });
            }}
          >
            Last 90 days
          </Button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className='flex justify-end'>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='flex items-center space-x-2'
            >
              <X className='h-4 w-4' />
              <span>Clear Filters</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
