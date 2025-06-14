'use client';

import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';
import { NotificationList } from '@/components/notifications/NotificationList';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { NotificationType } from '@/types/notification.types';
import { useState } from 'react';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Placeholder close function that doesn't do anything since this is a full page
  const dummyClose = () => {};

  return (
    <StudentDashboardLayout title='Notifications'>
      <Card className='w-full'>
        <CardHeader className='pb-3'>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>

        <div className='px-6'>
          <Tabs
            defaultValue='all'
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='w-full sm:w-auto'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='academic'>Academic</TabsTrigger>
              <TabsTrigger value='event'>Events</TabsTrigger>
              <TabsTrigger value='urgent'>Urgent</TabsTrigger>
            </TabsList>

            <TabsContent value='all' className='mt-0 pt-6'>
              <CardContent className='p-0'>
                <NotificationList
                  closeFn={dummyClose}
                  maxHeight='max-h-[600px]'
                  fullPage={true}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value='general' className='mt-0 pt-6'>
              <CardContent className='p-0'>
                <FilteredNotifications type={NotificationType.GENERAL} />
              </CardContent>
            </TabsContent>

            <TabsContent value='academic' className='mt-0 pt-6'>
              <CardContent className='p-0'>
                <FilteredNotifications type={NotificationType.ACADEMIC} />
              </CardContent>
            </TabsContent>

            <TabsContent value='event' className='mt-0 pt-6'>
              <CardContent className='p-0'>
                <FilteredNotifications type={NotificationType.EVENT} />
              </CardContent>
            </TabsContent>

            <TabsContent value='urgent' className='mt-0 pt-6'>
              <CardContent className='p-0'>
                <FilteredNotifications type={NotificationType.URGENT} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </StudentDashboardLayout>
  );
};

const FilteredNotifications = ({ type }: { type: NotificationType }) => {
  // The filtering will be handled by the API when we implement it
  // For now, we're just rendering the NotificationList component

  return (
    <NotificationList
      closeFn={() => {}}
      maxHeight='max-h-[600px]'
      fullPage={true}
    />
  );
};

export default NotificationsPage;
