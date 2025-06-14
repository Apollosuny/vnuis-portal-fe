'use client';

import { useState } from 'react';
import {
  Plus,
  Send,
  RotateCcw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
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
import { mockNotifications, mockNotificationStats } from './mock-data';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
} from '@/types/notification.types';
import { NotificationForm, NotificationDetail, StatsCards } from './components';

export default function NotificationManagementPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || notification.status === statusFilter;
    const matchesType =
      typeFilter === 'all' || notification.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSendNotification = (notification: Notification) => {
    if (
      notification.status !== NotificationStatus.DRAFT &&
      notification.status !== NotificationStatus.SCHEDULED
    ) {
      toast.error('Can only send notifications in draft or scheduled status');
      return;
    }

    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notification.id
          ? {
              ...n,
              status: NotificationStatus.SENT,
              sentAt: new Date().toISOString(),
            }
          : n
      )
    );

    toast.success(`Notification sent: ${notification.title}`);
  };

  const handleRevokeNotification = (notification: Notification) => {
    if (notification.status !== NotificationStatus.SENT) {
      toast.error('Can only revoke sent notifications');
      return;
    }

    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notification.id
          ? {
              ...n,
              status: NotificationStatus.REVOKED,
              revokedAt: new Date().toISOString(),
            }
          : n
      )
    );

    toast.success(`Notification revoked: ${notification.title}`);
  };

  const handleDeleteNotification = (notification: Notification) => {
    if (notification.status === NotificationStatus.SENT) {
      toast.error('Cannot delete sent notifications. Please revoke first.');
      return;
    }

    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== notification.id)
    );

    toast.success(`Notification deleted: ${notification.title}`);
  };

  const handleCreateNotification = (data: Partial<Notification>) => {
    const newNotification: Notification = {
      ...data,
      id: `notification_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'admin@university.edu', // This should come from auth context
      status: data.scheduledAt
        ? NotificationStatus.SCHEDULED
        : NotificationStatus.DRAFT,
    } as Notification;

    setNotifications((prev) => [newNotification, ...prev]);
    setIsFormOpen(false);
    toast.success('Notification created successfully');
  };

  const handleUpdateNotification = (data: Partial<Notification>) => {
    if (!editingNotification) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === editingNotification.id ? { ...n, ...data } : n))
    );

    setEditingNotification(null);
    setIsFormOpen(false);
    toast.success('Notification updated successfully');
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
    const variants = {
      [NotificationStatus.DRAFT]: 'secondary',
      [NotificationStatus.SCHEDULED]: 'default',
      [NotificationStatus.SENT]: 'success',
      [NotificationStatus.REVOKED]: 'destructive',
    } as const;

    const labels = {
      [NotificationStatus.DRAFT]: 'Draft',
      [NotificationStatus.SCHEDULED]: 'Scheduled',
      [NotificationStatus.SENT]: 'Sent',
      [NotificationStatus.REVOKED]: 'Revoked',
    };

    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    const variants = {
      low: 'secondary',
      normal: 'default',
      high: 'warning',
      critical: 'destructive',
    } as const;

    const labels = {
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      critical: 'Critical',
    };

    return (
      <Badge variant={variants[priority] as any}>{labels[priority]}</Badge>
    );
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      [NotificationType.GENERAL]: 'General',
      [NotificationType.ACADEMIC]: 'Academic',
      [NotificationType.EVENT]: 'Event',
      [NotificationType.SYSTEM]: 'System',
      [NotificationType.URGENT]: 'Urgent',
    };
    return labels[type];
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
        <StatsCards stats={mockNotificationStats} />

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
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='scheduled'>Scheduled</SelectItem>
                  <SelectItem value='sent'>Sent</SelectItem>
                  <SelectItem value='revoked'>Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Notification Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='general'>General</SelectItem>
                  <SelectItem value='academic'>Academic</SelectItem>
                  <SelectItem value='event'>Event</SelectItem>
                  <SelectItem value='system'>System</SelectItem>
                  <SelectItem value='urgent'>Urgent</SelectItem>
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
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className='font-medium max-w-xs'>
                      <div className='truncate' title={notification.title}>
                        {notification.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(notification.priority)}
                    </TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
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
                            onClick={() => handleSendNotification(notification)}
                            className='text-green-600 hover:text-green-700'
                          >
                            <Send className='h-4 w-4' />
                          </Button>
                        )}
                        {notification.status === NotificationStatus.SENT && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              handleRevokeNotification(notification)
                            }
                            className='text-orange-600 hover:text-orange-700'
                          >
                            <RotateCcw className='h-4 w-4' />
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteNotification(notification)}
                          disabled={
                            notification.status === NotificationStatus.SENT
                          }
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
