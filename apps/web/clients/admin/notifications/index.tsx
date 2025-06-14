'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Send,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { DateTime } from 'luxon';
import {
  Card,
  CardContent,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationStats,
} from '@/types/notification.types';
import { NotificationForm, NotificationDetail, StatsCards } from './components';

export default function NotificationManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch notifications using React Query
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    error: notificationsError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const result = await notificationApi.getNotifications();
      console.log('Notifications data received:', result);
      // Check if any notification has missing fields
      if (result && Array.isArray(result) && result.length > 0) {
        const sample = result[0];
        console.log('Sample notification:', sample);
        console.log(
          'Fields check - type:',
          sample.type,
          'priority:',
          sample.priority,
          'status:',
          sample.status
        );
      }
      return result;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Ensure notifications is an array with proper default
  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : [];

  // Fetch notification stats using React Query
  const {
    data: rawNotificationStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => notificationApi.getNotificationStats(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Process stats to ensure all values are numbers
  const notificationStats: NotificationStats = {
    total:
      typeof rawNotificationStats?.total === 'number'
        ? rawNotificationStats.total
        : 0,
    draft:
      typeof rawNotificationStats?.draft === 'number'
        ? rawNotificationStats.draft
        : 0,
    scheduled:
      typeof rawNotificationStats?.scheduled === 'number'
        ? rawNotificationStats.scheduled
        : 0,
    sent:
      typeof rawNotificationStats?.sent === 'number'
        ? rawNotificationStats.sent
        : 0,
    revoked:
      typeof rawNotificationStats?.revoked === 'number'
        ? rawNotificationStats.revoked
        : 0,
    readRate:
      typeof rawNotificationStats?.readRate === 'number'
        ? rawNotificationStats.readRate
        : 0,
  };

  // Show errors if any
  if (notificationsError) {
    console.error('Error fetching notifications:', notificationsError);
    toast.error('Failed to load notifications');
  }

  if (statsError) {
    console.error('Error fetching stats:', statsError);
    toast.error('Failed to load notification statistics');
  }

  // Process and normalize notifications data
  const processedNotifications = notifications.map(
    (notification: any): Notification => {
      // Ensure type has a valid value and is uppercase
      let type = notification.type;
      if (type && typeof type === 'string') {
        type = type.toUpperCase();
        if (!Object.values(NotificationType).includes(type)) {
          type = NotificationType.GENERAL;
        }
      } else {
        type = NotificationType.GENERAL;
      }

      // Ensure priority has a valid value and is uppercase
      let priority = notification.priority;
      if (priority && typeof priority === 'string') {
        priority = priority.toUpperCase();
        if (!Object.values(NotificationPriority).includes(priority)) {
          priority = NotificationPriority.NORMAL;
        }
      } else {
        priority = NotificationPriority.NORMAL;
      }

      // Ensure status has a valid value and is uppercase
      let status = notification.status;
      if (status && typeof status === 'string') {
        status = status.toUpperCase();
        if (!Object.values(NotificationStatus).includes(status)) {
          status = NotificationStatus.DRAFT;
        }
      } else {
        status = NotificationStatus.DRAFT;
      }

      return {
        ...notification,
        type,
        priority,
        status,
      };
    }
  );

  console.log('Processed notifications:', processedNotifications);

  // Filter notifications
  const filteredNotifications = processedNotifications.filter(
    (notification: Notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || notification.status === statusFilter;
      const matchesType =
        typeFilter === 'all' || notification.type === typeFilter;
      const matchesPriority =
        priorityFilter === 'all' || notification.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    }
  );

  // Paginate the notifications
  useEffect(() => {
    setTotalPages(
      Math.max(1, Math.ceil(filteredNotifications.length / pageSize))
    );
    // Reset to first page when filters change
    setPage(1);
  }, [
    filteredNotifications.length,
    pageSize,
    searchTerm,
    statusFilter,
    typeFilter,
    priorityFilter,
  ]);

  const startIndex = (page - 1) * pageSize;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + pageSize
  );

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationApi.sendNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    },
  });

  // Revoke notification mutation
  const revokeNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationApi.revokeNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
    onError: (error) => {
      console.error('Error revoking notification:', error);
      toast.error('Failed to revoke notification');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    },
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: (data: Partial<Notification>) =>
      notificationApi.createNotification(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      setIsFormOpen(false);
      toast.success('Notification created successfully');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    },
  });

  // Update notification mutation
  const updateNotificationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Notification> }) =>
      notificationApi.updateNotification(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      setEditingNotification(null);
      setIsFormOpen(false);
      toast.success('Notification updated successfully');
    },
    onError: (error) => {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    },
  });

  const handleSendNotification = (notification: Notification) => {
    if (
      notification.status !== NotificationStatus.DRAFT &&
      notification.status !== NotificationStatus.SCHEDULED
    ) {
      toast.error('Can only send notifications in draft or scheduled status');
      return;
    }

    sendNotificationMutation.mutate(notification.id, {
      onSuccess: () => {
        toast.success(`Notification sent: ${notification.title}`);
      },
    });
  };

  const handleRevokeNotification = (notification: Notification) => {
    if (notification.status !== NotificationStatus.SENT) {
      toast.error('Can only revoke sent notifications');
      return;
    }

    revokeNotificationMutation.mutate(notification.id, {
      onSuccess: () => {
        toast.success(`Notification revoked: ${notification.title}`);
      },
    });
  };

  const handleDeleteNotification = (notification: Notification) => {
    if (notification.status === NotificationStatus.SENT) {
      toast.error('Cannot delete sent notifications. Please revoke first.');
      return;
    }

    deleteNotificationMutation.mutate(notification.id, {
      onSuccess: () => {
        toast.success(`Notification deleted: ${notification.title}`);
      },
    });
  };

  const handleCreateNotification = (data: Partial<Notification>) => {
    createNotificationMutation.mutate(data);
  };

  const handleUpdateNotification = (data: Partial<Notification>) => {
    if (!editingNotification) return;

    updateNotificationMutation.mutate({
      id: editingNotification.id,
      data,
    });
  };

  const handleEditNotification = (notification: Notification) => {
    if (
      notification.status === NotificationStatus.SENT ||
      notification.status === NotificationStatus.REVOKED
    ) {
      toast.error('Cannot edit sent or revoked notifications');
      return;
    }

    setEditingNotification(notification);
    setIsFormOpen(true);
  };

  const getStatusBadge = (status: NotificationStatus) => {
    // Map uppercase DB values to our display values
    const statusMap: Record<string, { variant: string; label: string }> = {
      [NotificationStatus.DRAFT]: { variant: 'secondary', label: 'Draft' },
      [NotificationStatus.SCHEDULED]: {
        variant: 'default',
        label: 'Scheduled',
      },
      [NotificationStatus.SENT]: { variant: 'success', label: 'Sent' },
      [NotificationStatus.REVOKED]: {
        variant: 'destructive',
        label: 'Revoked',
      },
    };

    // In case status is not a valid enum value
    if (!status || !Object.values(NotificationStatus).includes(status)) {
      console.warn(`Invalid status value: ${status}`);
      return <Badge variant='secondary'>Unknown</Badge>;
    }

    const display = statusMap[status] || {
      variant: 'secondary',
      label: status,
    };

    return <Badge variant={display.variant as any}>{display.label}</Badge>;
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    // Map uppercase DB values to our display values
    const priorityMap: Record<string, { variant: string; label: string }> = {
      LOW: { variant: 'secondary', label: 'Low' },
      NORMAL: { variant: 'default', label: 'Normal' },
      HIGH: { variant: 'warning', label: 'High' },
      CRITICAL: { variant: 'destructive', label: 'Critical' },
    };

    // In case priority is not a valid enum value
    if (!priority || !Object.values(NotificationPriority).includes(priority)) {
      console.warn(`Invalid priority value: ${priority}`);
      return <Badge variant='secondary'>Unknown</Badge>;
    }

    const display = priorityMap[priority] || {
      variant: 'secondary',
      label: priority,
    };

    return <Badge variant={display.variant as any}>{display.label}</Badge>;
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels: Record<string, string> = {
      [NotificationType.GENERAL]: 'General',
      [NotificationType.ACADEMIC]: 'Academic',
      [NotificationType.EVENT]: 'Event',
      [NotificationType.SYSTEM]: 'System',
      [NotificationType.URGENT]: 'Urgent',
    };

    // In case type is not a valid enum value
    if (!type || !Object.values(NotificationType).includes(type)) {
      console.warn(`Invalid type value: ${type}`);
      return 'Unknown';
    }

    return labels[type] || 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Notification Management</h1>
            <p className='text-muted-foreground'>
              Create, send and manage notifications for students
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingNotification(null);
              setIsFormOpen(true);
            }}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Create New Notification
          </Button>
        </div>

        {/* Stats Cards */}
        {isLoadingStats ? (
          <div className='flex items-center justify-center p-6'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
          </div>
        ) : (
          <StatsCards stats={notificationStats} />
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter and Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by title or content...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='DRAFT'>Draft</SelectItem>
                  <SelectItem value='SCHEDULED'>Scheduled</SelectItem>
                  <SelectItem value='SENT'>Sent</SelectItem>
                  <SelectItem value='REVOKED'>Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Notification Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='GENERAL'>General</SelectItem>
                  <SelectItem value='ACADEMIC'>Academic</SelectItem>
                  <SelectItem value='EVENT'>Event</SelectItem>
                  <SelectItem value='SYSTEM'>System</SelectItem>
                  <SelectItem value='URGENT'>Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Priorities</SelectItem>
                  <SelectItem value='LOW'>Low</SelectItem>
                  <SelectItem value='NORMAL'>Normal</SelectItem>
                  <SelectItem value='HIGH'>High</SelectItem>
                  <SelectItem value='CRITICAL'>Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Notification List ({filteredNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingNotifications ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mr-2'></div>
                        <span>Loading notifications...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center'>
                      No notifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedNotifications.map((notification: Notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className='font-medium max-w-xs'>
                        <div className='truncate' title={notification.title}>
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {notification.type
                            ? getTypeLabel(notification.type)
                            : 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.priority ? (
                          getPriorityBadge(notification.priority)
                        ) : (
                          <Badge variant='secondary'>Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {notification.status ? (
                          getStatusBadge(notification.status)
                        ) : (
                          <Badge variant='secondary'>Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {DateTime.fromISO(notification.createdAt).toFormat(
                          'dd/MM/yyyy HH:mm'
                        )}
                      </TableCell>
                      <TableCell>
                        {notification.sentAt
                          ? DateTime.fromISO(notification.sentAt).toFormat(
                              'dd/MM/yyyy HH:mm'
                            )
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedNotification(notification);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEditNotification(notification)}
                            disabled={
                              notification.status === NotificationStatus.SENT ||
                              notification.status === NotificationStatus.REVOKED
                            }
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          {(notification.status === NotificationStatus.DRAFT ||
                            notification.status ===
                              NotificationStatus.SCHEDULED) && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleSendNotification(notification)
                              }
                              disabled={sendNotificationMutation.isPending}
                              className='text-green-600 hover:text-green-700'
                            >
                              {sendNotificationMutation.isPending &&
                              sendNotificationMutation.variables ===
                                notification.id ? (
                                <div className='animate-spin h-4 w-4 border-t-2 border-b-2 border-green-600 rounded-full' />
                              ) : (
                                <Send className='h-4 w-4' />
                              )}
                            </Button>
                          )}
                          {notification.status === NotificationStatus.SENT && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleRevokeNotification(notification)
                              }
                              disabled={revokeNotificationMutation.isPending}
                              className='text-orange-600 hover:text-orange-700'
                            >
                              {revokeNotificationMutation.isPending &&
                              revokeNotificationMutation.variables ===
                                notification.id ? (
                                <div className='animate-spin h-4 w-4 border-t-2 border-b-2 border-orange-600 rounded-full' />
                              ) : (
                                <RotateCcw className='h-4 w-4' />
                              )}
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleDeleteNotification(notification)
                            }
                            disabled={
                              notification.status === NotificationStatus.SENT ||
                              deleteNotificationMutation.isPending
                            }
                            className='text-red-600 hover:text-red-700'
                          >
                            {deleteNotificationMutation.isPending &&
                            deleteNotificationMutation.variables ===
                              notification.id ? (
                              <div className='animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full' />
                            ) : (
                              <Trash2 className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {filteredNotifications.length > 0 && (
              <div className='flex items-center justify-between mt-4 space-x-2'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-muted-foreground'>
                    Showing {startIndex + 1} to{' '}
                    {Math.min(
                      startIndex + pageSize,
                      filteredNotifications.length
                    )}{' '}
                    of {filteredNotifications.length} notifications
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className='w-[100px]'>
                      <SelectValue placeholder='Page size' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5 per page</SelectItem>
                      <SelectItem value='10'>10 per page</SelectItem>
                      <SelectItem value='20'>20 per page</SelectItem>
                      <SelectItem value='50'>50 per page</SelectItem>
                    </SelectContent>
                  </Select>

                  <nav className='flex items-center space-x-1'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className='h-4 w-4' />
                      <span className='sr-only'>First page</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                      <span className='sr-only'>Previous page</span>
                    </Button>
                    <div className='flex items-center justify-center text-sm font-medium px-4'>
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className='h-4 w-4' />
                      <span className='sr-only'>Next page</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      <ChevronsRight className='h-4 w-4' />
                      <span className='sr-only'>Last page</span>
                    </Button>
                  </nav>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Notification Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {editingNotification
                  ? 'Edit Notification'
                  : 'Create New Notification'}
              </DialogTitle>
            </DialogHeader>
            <NotificationForm
              notification={editingNotification}
              onSubmit={
                editingNotification
                  ? handleUpdateNotification
                  : handleCreateNotification
              }
              isLoading={
                createNotificationMutation.isPending ||
                updateNotificationMutation.isPending
              }
              onCancel={() => {
                setIsFormOpen(false);
                setEditingNotification(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Notification Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
            </DialogHeader>
            {selectedNotification && (
              <NotificationDetail
                notification={selectedNotification}
                onClose={() => setIsDetailOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
