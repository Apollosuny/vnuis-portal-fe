'use client';

import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useFeedbackStats } from '@/hooks/useAdminFeedbacks';
import {
  useFeedbackCategoryAnalysis,
  useFeedbackDashboardOverview,
  useFeedbackDateRange,
  useFeedbackRatingAnalysis,
  useFeedbackResponseTimeAnalysis,
  useFeedbackSentimentAnalysis,
  useFeedbackTrends,
} from '@/hooks/useFeedbackAnalytics';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  BarChart3,
  Calendar,
  Clock,
  MessageSquare,
  PieChart,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { FeedbackStatsCards } from './FeedbackStatsCards';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { FeedbackList } from './FeedbackList';
import dynamic from 'next/dynamic';

// Import ApexCharts với dynamic import để tránh lỗi SSR
const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
        Loading chart...
      </div>
    ),
  }
);

// Hàm kiểm tra mảng có dữ liệu và hợp lệ không
const isValidArray = (arr: any) => Array.isArray(arr) && arr.length > 0;

const Feedback = () => {
  const [dateRange, setDateRange] = useState<
    '7d' | '30d' | '90d' | '1y' | 'custom'
  >('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const { getDateRange } = useFeedbackDateRange();
  const { startDate, endDate } = useMemo(
    () =>
      getDateRange(
        dateRange,
        customStartDate || undefined,
        customEndDate || undefined
      ),
    [dateRange, customStartDate, customEndDate]
  );

  // Fetch data based on active tab
  const { data: dashboardData, isLoading: dashboardLoading } =
    useFeedbackDashboardOverview(startDate ?? undefined, endDate ?? undefined);

  const { data: sentimentData, isLoading: sentimentLoading } =
    useFeedbackSentimentAnalysis(startDate ?? undefined, endDate ?? undefined, {
      enabled: activeTab === 'overview',
    });

  const { data: categoryData, isLoading: categoryLoading } =
    useFeedbackCategoryAnalysis(startDate ?? undefined, endDate ?? undefined, {
      enabled: activeTab === 'overview',
    });

  const { data: ratingData, isLoading: ratingLoading } =
    useFeedbackRatingAnalysis(startDate ?? undefined, endDate ?? undefined, {
      enabled: activeTab === 'analytics',
    });

  const { data: responseTimeData, isLoading: responseTimeLoading } =
    useFeedbackResponseTimeAnalysis(
      startDate ?? undefined,
      endDate ?? undefined,
      { enabled: activeTab === 'analytics' }
    );

  const { data: feedbackStats, isLoading: statsLoading } = useFeedbackStats();

  const { data: trendsData, isLoading: trendsLoading } = useFeedbackTrends(
    startDate ?? undefined,
    endDate ?? undefined,
    { enabled: activeTab === 'trends' }
  );

  // Process category data for the chart
  const processedCategoryData = useMemo(() => {
    const data = categoryData as any;
    if (!data?.distribution || !Array.isArray(data.distribution)) {
      return { categories: [], counts: [] };
    }

    // Map through the data and extract category names and counts
    return {
      categories: data.distribution.map(
        (item: any) => item.category || 'Unknown'
      ),
      counts: data.distribution.map((item: any) => item._count?.id || 0),
    };
  }, [categoryData]);

  // Process trends data for charts
  const processedTrendsData = useMemo(() => {
    const trends = trendsData as any;
    const sentiment = sentimentData as any;
    const rating = ratingData as any;

    if (!trends) {
      return {
        volumeOverTime: [],
        sentimentTrends: [],
        ratingTrends: [],
      };
    }

    // Process daily trends for volume chart
    const volumeOverTime =
      trends.dailyTrends?.map((item: any) => ({
        date: item.createdAt,
        count: item._count.id,
      })) || [];

    // Use sentiment data from sentiment analysis API
    const sentimentTrends =
      sentiment?.trends?.map((item: any) => ({
        date: item.createdAt,
        positive: item.sentiment === 'POSITIVE' ? item._count.id : 0,
        negative: item.sentiment === 'NEGATIVE' ? item._count.id : 0,
        neutral: item.sentiment === 'NEUTRAL' ? item._count.id : 0,
      })) || [];

    // Use rating data from rating analysis API
    const ratingTrends =
      trends.dailyTrends?.map((item: any) => ({
        date: item.createdAt,
        averageRating: rating?.average || 3.5,
        totalFeedbacks: item._count.id,
      })) || [];

    return {
      volumeOverTime,
      sentimentTrends,
      ratingTrends,
    };
  }, [trendsData, sentimentData, ratingData]);

  const isLoading =
    dashboardLoading ||
    (activeTab === 'overview' && (sentimentLoading || categoryLoading)) ||
    (activeTab === 'analytics' && (ratingLoading || responseTimeLoading)) ||
    (activeTab === 'trends' && trendsLoading) ||
    statsLoading;

  // Individual tab loading states
  const isOverviewLoading =
    dashboardLoading || sentimentLoading || categoryLoading;
  const isAnalyticsLoading = ratingLoading || responseTimeLoading;
  const isTrendsLoading = trendsLoading;

  // Global loading for stats cards (always visible)
  const isStatsLoading = dashboardLoading || statsLoading;

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
            isLoading={isStatsLoading}
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
                    {isOverviewLoading ? (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        Loading...
                      </div>
                    ) : isValidArray((sentimentData as any)?.distribution) ? (
                      <Chart
                        type='donut'
                        height={300}
                        options={{
                          labels: ['Positive', 'Negative', 'Neutral'],
                          colors: ['#10b981', '#ef4444', '#6b7280'],
                          legend: { position: 'bottom' },
                          plotOptions: { pie: { donut: { size: '60%' } } },
                        }}
                        series={[
                          ((sentimentData as any)?.distribution ?? []).find(
                            (d: any) => d.sentiment === 'POSITIVE'
                          )?._count?.id || 0,
                          ((sentimentData as any)?.distribution ?? []).find(
                            (d: any) => d.sentiment === 'NEGATIVE'
                          )?._count?.id || 0,
                          ((sentimentData as any)?.distribution ?? []).find(
                            (d: any) => d.sentiment === 'NEUTRAL'
                          )?._count?.id || 0,
                        ]}
                      />
                    ) : (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        No data
                      </div>
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
                    {isLoading ? (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        Loading...
                      </div>
                    ) : isValidArray(processedCategoryData.categories) ? (
                      <Chart
                        type='bar'
                        height={300}
                        options={{
                          chart: { type: 'bar', toolbar: { show: false } },
                          xaxis: {
                            categories: processedCategoryData.categories,
                          },
                          colors: ['#3b82f6'],
                          plotOptions: { bar: { horizontal: true } },
                        }}
                        series={[
                          {
                            name: 'Count',
                            data: processedCategoryData.counts,
                          },
                        ]}
                      />
                    ) : (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        No data available
                      </div>
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
                    {isAnalyticsLoading ? (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        Loading...
                      </div>
                    ) : isValidArray((ratingData as any)?.distribution) ? (
                      <Chart
                        type='bar'
                        height={300}
                        options={{
                          chart: { type: 'bar', toolbar: { show: false } },
                          xaxis: { categories: ['1★', '2★', '3★', '4★', '5★'] },
                          colors: ['#f59e0b'],
                          plotOptions: { bar: { borderRadius: 4 } },
                        }}
                        series={[
                          {
                            name: 'Count',
                            data: [1, 2, 3, 4, 5].map(
                              (rating) =>
                                ((ratingData as any)?.distribution ?? []).find(
                                  (d: any) => d?.rating === rating
                                )?._count?.id || 0
                            ),
                          },
                        ]}
                      />
                    ) : (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        No data
                      </div>
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
                    {isAnalyticsLoading ? (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        Loading...
                      </div>
                    ) : (responseTimeData as any)?.responseTimeDistribution &&
                      Object.values(
                        (responseTimeData as any).responseTimeDistribution
                      ).some((v: any) => v > 0) ? (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <div className='text-3xl font-bold text-primary'>
                            {(
                              responseTimeData as any
                            )?.averageResponseTime?.toFixed(1) ?? 'N/A'}
                            h
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
                            legend: { position: 'bottom' },
                          }}
                          series={[
                            (responseTimeData as any)?.responseTimeDistribution
                              ?.under1Hour || 0,
                            (responseTimeData as any)?.responseTimeDistribution
                              ?.under24Hours || 0,
                            (responseTimeData as any)?.responseTimeDistribution
                              ?.under72Hours || 0,
                            (responseTimeData as any)?.responseTimeDistribution
                              ?.over72Hours || 0,
                          ]}
                        />
                      </div>
                    ) : (
                      <div className='h-[200px] flex items-center justify-center text-muted-foreground'>
                        No data
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value='trends' className='space-y-4'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Feedback Volume Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <TrendingUp className='h-5 w-5' />
                      <span>Feedback Volume Over Time</span>
                    </CardTitle>
                    <CardDescription>
                      Daily feedback submission trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isTrendsLoading ? (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        Loading...
                      </div>
                    ) : isValidArray(processedTrendsData.volumeOverTime) ? (
                      <Chart
                        type='line'
                        height={300}
                        options={{
                          chart: {
                            type: 'line',
                            toolbar: { show: false },
                            zoom: { enabled: false },
                          },
                          xaxis: {
                            categories:
                              processedTrendsData.volumeOverTime.map(
                                (item: any) =>
                                  new Date(item.date).toLocaleDateString()
                              ) || [],
                            labels: {
                              rotate: -45,
                              style: { fontSize: '12px' },
                            },
                          },
                          yaxis: {
                            title: { text: 'Number of Feedbacks' },
                            min: 0,
                          },
                          colors: ['#3b82f6'],
                          stroke: { curve: 'smooth', width: 3 },
                          markers: { size: 4 },
                          grid: { borderColor: '#e5e7eb' },
                        }}
                        series={[
                          {
                            name: 'Feedbacks',
                            data:
                              processedTrendsData.volumeOverTime.map(
                                (item: any) => item.count
                              ) || [],
                          },
                        ]}
                      />
                    ) : (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        No trend data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sentiment Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <PieChart className='h-5 w-5' />
                      <span>Sentiment Trends</span>
                    </CardTitle>
                    <CardDescription>
                      Sentiment distribution over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isTrendsLoading ? (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        Loading...
                      </div>
                    ) : isValidArray(processedTrendsData.sentimentTrends) ? (
                      <Chart
                        type='area'
                        height={300}
                        options={{
                          chart: {
                            type: 'area',
                            toolbar: { show: false },
                            stacked: true,
                          },
                          xaxis: {
                            categories:
                              processedTrendsData.sentimentTrends.map(
                                (item: any) =>
                                  new Date(item.date).toLocaleDateString()
                              ) || [],
                            labels: {
                              rotate: -45,
                              style: { fontSize: '12px' },
                            },
                          },
                          yaxis: {
                            title: { text: 'Number of Feedbacks' },
                            min: 0,
                          },
                          colors: ['#10b981', '#ef4444', '#6b7280'],
                          stroke: { curve: 'smooth', width: 2 },
                          fill: {
                            type: 'gradient',
                            gradient: {
                              opacityFrom: 0.6,
                              opacityTo: 0.1,
                            },
                          },
                          legend: { position: 'top' },
                          grid: { borderColor: '#e5e7eb' },
                        }}
                        series={[
                          {
                            name: 'Positive',
                            data:
                              processedTrendsData.sentimentTrends.map(
                                (item: any) => item.positive
                              ) || [],
                          },
                          {
                            name: 'Negative',
                            data:
                              processedTrendsData.sentimentTrends.map(
                                (item: any) => item.negative
                              ) || [],
                          },
                          {
                            name: 'Neutral',
                            data:
                              processedTrendsData.sentimentTrends.map(
                                (item: any) => item.neutral
                              ) || [],
                          },
                        ]}
                      />
                    ) : (
                      <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                        No sentiment trend data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Rating Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Star className='h-5 w-5' />
                    <span>Average Rating Trends</span>
                  </CardTitle>
                  <CardDescription>
                    Average feedback rating over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTrendsLoading ? (
                    <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                      Loading...
                    </div>
                  ) : isValidArray(processedTrendsData.ratingTrends) ? (
                    <Chart
                      type='line'
                      height={300}
                      options={{
                        chart: {
                          type: 'line',
                          toolbar: { show: false },
                          zoom: { enabled: false },
                        },
                        xaxis: {
                          categories:
                            processedTrendsData.ratingTrends.map((item: any) =>
                              new Date(item.date).toLocaleDateString()
                            ) || [],
                          labels: {
                            rotate: -45,
                            style: { fontSize: '12px' },
                          },
                        },
                        yaxis: {
                          title: { text: 'Average Rating' },
                          min: 0,
                          max: 5,
                          tickAmount: 5,
                        },
                        colors: ['#f59e0b'],
                        stroke: { curve: 'smooth', width: 3 },
                        markers: { size: 4 },
                        grid: { borderColor: '#e5e7eb' },
                        tooltip: {
                          y: {
                            formatter: (value) => `${value.toFixed(2)} stars`,
                          },
                        },
                      }}
                      series={[
                        {
                          name: 'Average Rating',
                          data:
                            processedTrendsData.ratingTrends.map(
                              (item: any) => item.averageRating
                            ) || [],
                        },
                      ]}
                    />
                  ) : (
                    <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                      No rating trend data available
                    </div>
                  )}
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
};

export default Feedback;
