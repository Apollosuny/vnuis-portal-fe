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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  Calendar,
  Search,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic imports for charts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Import hooks
import {
  useFeedbackDashboardOverview,
  useFeedbackSentimentAnalysis,
  useFeedbackCategoryAnalysis,
  useFeedbackRatingAnalysis,
  useFeedbackResponseTimeAnalysis,
  useFeedbackDateRange,
} from '@/hooks/useFeedbackAnalytics';
import { useAdminFeedbacks, useFeedbackStats } from '@/hooks/useAdminFeedbacks';

// Import components
import { FeedbackList, FeedbackStatsCards } from '@/clients/admin/feedback';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function AdminFeedbackPage() {
  const [dateRange, setDateRange] = useState<
    '7d' | '30d' | '90d' | '1y' | 'custom'
  >('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const { getDateRange } = useFeedbackDateRange();
  const { startDate, endDate } = getDateRange(
    dateRange,
    customStartDate || undefined,
    customEndDate || undefined
  );

  // Fetch data
  const { data: dashboardData, isLoading: dashboardLoading } =
    useFeedbackDashboardOverview(startDate ?? undefined, endDate ?? undefined);
  const { data: sentimentData, isLoading: sentimentLoading } =
    useFeedbackSentimentAnalysis(startDate ?? undefined, endDate ?? undefined);
  const { data: categoryData, isLoading: categoryLoading } =
    useFeedbackCategoryAnalysis(startDate ?? undefined, endDate ?? undefined);
  const { data: ratingData, isLoading: ratingLoading } =
    useFeedbackRatingAnalysis(startDate ?? undefined, endDate ?? undefined);
  const { data: responseTimeData, isLoading: responseTimeLoading } =
    useFeedbackResponseTimeAnalysis(
      startDate ?? undefined,
      endDate ?? undefined
    );
  const { data: feedbackStats, isLoading: statsLoading } = useFeedbackStats();

  const isLoading =
    dashboardLoading ||
    sentimentLoading ||
    categoryLoading ||
    ratingLoading ||
    responseTimeLoading ||
    statsLoading;

  return (
    <AuthenticatedGuard>
      <DashboardLayout>
        <div className='space-y-6 p-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Feedback Management
              </h1>
              <p className='text-muted-foreground'>
                Monitor and analyze student feedback to improve the system
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant='outline' size='sm'>
                <Calendar className='h-4 w-4 mr-2' />
                Export Report
              </Button>
            </div>
          </div>

          {/* Date Range Selector */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-medium'>Date Range:</span>
                  <Select
                    value={dateRange}
                    onValueChange={(value: any) => setDateRange(value)}
                  >
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='7d'>Last 7 days</SelectItem>
                      <SelectItem value='30d'>Last 30 days</SelectItem>
                      <SelectItem value='90d'>Last 90 days</SelectItem>
                      <SelectItem value='1y'>Last year</SelectItem>
                      <SelectItem value='custom'>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateRange === 'custom' && (
                  <div className='flex items-center space-x-2'>
                    <Input
                      type='date'
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className='w-40'
                    />
                    <span>to</span>
                    <Input
                      type='date'
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className='w-40'
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <FeedbackStatsCards
            dashboardData={dashboardData}
            responseTimeData={responseTimeData}
            isLoading={isLoading}
          />

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-4'
          >
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger
                value='overview'
                className='flex items-center space-x-2'
              >
                <BarChart3 className='h-4 w-4' />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value='analytics'
                className='flex items-center space-x-2'
              >
                <PieChart className='h-4 w-4' />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value='trends'
                className='flex items-center space-x-2'
              >
                <TrendingUp className='h-4 w-4' />
                <span>Trends</span>
              </TabsTrigger>
              <TabsTrigger value='list' className='flex items-center space-x-2'>
                <MessageSquare className='h-4 w-4' />
                <span>Feedback List</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value='overview' className='space-y-4'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Sentiment Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <PieChart className='h-5 w-5' />
                      <span>Sentiment Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      Distribution of feedback by sentiment analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sentimentData && (
                      <Chart
                        type='donut'
                        height={300}
                        options={{
                          labels: ['Positive', 'Negative', 'Neutral'],
                          colors: ['#10b981', '#ef4444', '#6b7280'],
                          legend: {
                            position: 'bottom',
                          },
                          plotOptions: {
                            pie: {
                              donut: {
                                size: '60%',
                              },
                            },
                          },
                        }}
                        series={[
                          sentimentData.distribution.find(
                            (d) => d.sentiment === 'POSITIVE'
                          )?._count.id || 0,
                          sentimentData.distribution.find(
                            (d) => d.sentiment === 'NEGATIVE'
                          )?._count.id || 0,
                          sentimentData.distribution.find(
                            (d) => d.sentiment === 'NEUTRAL'
                          )?._count.id || 0,
                        ]}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <BarChart3 className='h-5 w-5' />
                      <span>Category Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      Feedback distribution by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryData && (
                      <Chart
                        type='bar'
                        height={300}
                        options={{
                          chart: {
                            type: 'bar',
                            toolbar: {
                              show: false,
                            },
                          },
                          xaxis: {
                            categories: categoryData.distribution.map(
                              (d) => d.category
                            ),
                          },
                          colors: ['#3b82f6'],
                          plotOptions: {
                            bar: {
                              horizontal: true,
                            },
                          },
                        }}
                        series={[
                          {
                            name: 'Count',
                            data: categoryData.distribution.map((d) => d.count),
                          },
                        ]}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value='analytics' className='space-y-4'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Rating Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <Star className='h-5 w-5' />
                      <span>Rating Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      Distribution of feedback ratings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ratingData && (
                      <Chart
                        type='bar'
                        height={300}
                        options={{
                          chart: {
                            type: 'bar',
                            toolbar: {
                              show: false,
                            },
                          },
                          xaxis: {
                            categories: ['1★', '2★', '3★', '4★', '5★'],
                          },
                          colors: ['#f59e0b'],
                          plotOptions: {
                            bar: {
                              borderRadius: 4,
                            },
                          },
                        }}
                        series={[
                          {
                            name: 'Count',
                            data: [1, 2, 3, 4, 5].map(
                              (rating) =>
                                ratingData.distribution.find(
                                  (d) => d.rating === rating
                                )?._count.id || 0
                            ),
                          },
                        ]}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Response Time Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <Clock className='h-5 w-5' />
                      <span>Response Time Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Average response time and distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {responseTimeData && (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <div className='text-3xl font-bold text-primary'>
                            {responseTimeData.averageResponseTime.toFixed(1)}h
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            Average Response Time
                          </div>
                        </div>
                        <Chart
                          type='pie'
                          height={200}
                          options={{
                            labels: ['< 1h', '< 24h', '< 72h', '> 72h'],
                            colors: [
                              '#10b981',
                              '#3b82f6',
                              '#f59e0b',
                              '#ef4444',
                            ],
                            legend: {
                              position: 'bottom',
                            },
                          }}
                          series={[
                            responseTimeData.responseTimeDistribution
                              .under1Hour,
                            responseTimeData.responseTimeDistribution
                              .under24Hours,
                            responseTimeData.responseTimeDistribution
                              .under72Hours,
                            responseTimeData.responseTimeDistribution
                              .over72Hours,
                          ]}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value='trends' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <TrendingUp className='h-5 w-5' />
                    <span>Feedback Trends</span>
                  </CardTitle>
                  <CardDescription>Feedback volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for trends chart - you can implement this based on your data structure */}
                  <div className='h-64 flex items-center justify-center text-muted-foreground'>
                    Trends chart will be implemented here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feedback List Tab */}
            <TabsContent value='list' className='space-y-4'>
              <FeedbackList />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthenticatedGuard>
  );
}
