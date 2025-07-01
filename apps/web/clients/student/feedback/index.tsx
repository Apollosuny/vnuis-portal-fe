'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, List, Search, Filter } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { FeedbackList } from './components/FeedbackList';
import { CreateFeedbackForm } from './components/CreateFeedbackForm';
import { FeedbackStats } from './components/FeedbackStats';
import { useMyFeedbacks } from '@/hooks/useFeedback';
import { FeedbackCategory, FeedbackStatus } from '@/api/feedback.api';

const StudentFeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useMyFeedbacks();
  const feedbacks = Array.isArray(data) ? data : [];

  // Filter feedbacks based on search and filters
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      !searchTerm ||
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || feedback.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' || feedback.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryLabel = (category: FeedbackCategory) => {
    switch (category) {
      case FeedbackCategory.GENERAL:
        return 'General';
      case FeedbackCategory.USER_EXPERIENCE:
        return 'User Experience';
      case FeedbackCategory.FUNCTIONALITY:
        return 'Functionality';
      case FeedbackCategory.PERFORMANCE:
        return 'Performance';
      case FeedbackCategory.DESIGN:
        return 'Design';
      case FeedbackCategory.CONTENT:
        return 'Content';
      case FeedbackCategory.TECHNICAL_ISSUE:
        return 'Technical Issue';
      case FeedbackCategory.SUGGESTION:
        return 'Suggestion';
      case FeedbackCategory.COMPLAINT:
        return 'Complaint';
      case FeedbackCategory.COMPLIMENT:
        return 'Compliment';
      default:
        return category;
    }
  };

  const getStatusLabel = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.SUBMITTED:
        return 'Submitted';
      case FeedbackStatus.UNDER_REVIEW:
        return 'Under Review';
      case FeedbackStatus.IN_PROGRESS:
        return 'In Progress';
      case FeedbackStatus.RESOLVED:
        return 'Resolved';
      case FeedbackStatus.CLOSED:
        return 'Closed';
      case FeedbackStatus.REJECTED:
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex items-center justify-between'
      >
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <MessageSquare className='h-6 w-6 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Feedback Center</h1>
            <p className='text-muted-foreground'>
              Share your thoughts and suggestions with us
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <FeedbackStats feedbacks={feedbacks} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger
              value='overview'
              className='flex items-center space-x-2'
            >
              <List className='h-4 w-4' />
              <span>My Feedback</span>
            </TabsTrigger>
            <TabsTrigger value='create' className='flex items-center space-x-2'>
              <Plus className='h-4 w-4' />
              <span>Submit Feedback</span>
            </TabsTrigger>
            <TabsTrigger value='search' className='flex items-center space-x-2'>
              <Search className='h-4 w-4' />
              <span>Search</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <input
                    type='text'
                    placeholder='Search feedback...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className='px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20'
                >
                  <option value='all'>All Categories</option>
                  {Object.values(FeedbackCategory).map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category)}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20'
                >
                  <option value='all'>All Status</option>
                  {Object.values(FeedbackStatus).map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feedback List */}
            <FeedbackList
              feedbacks={filteredFeedbacks}
              isLoading={isLoading}
              onRefresh={() => window.location.reload()}
            />
          </TabsContent>

          <TabsContent value='create' className='space-y-6'>
            <CreateFeedbackForm onSuccess={() => setActiveTab('overview')} />
          </TabsContent>

          <TabsContent value='search' className='space-y-6'>
            <div className='text-center py-12'>
              <Search className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Advanced Search</h3>
              <p className='text-muted-foreground'>
                Use the filters above to search through your feedback
                submissions.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default StudentFeedbackPage;
