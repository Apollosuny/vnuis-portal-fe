import { DateTime } from 'luxon';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import {
  Notification,
  NotificationStatus,
  NotificationPriority,
  NotificationType,
  NotificationTargetType,
} from '@/types/notification.types';
import { Student } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '@/api/student.api';

interface NotificationDetailProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationDetail({
  notification,
  onClose,
}: NotificationDetailProps) {
  const getStatusBadge = (status: NotificationStatus) => {
    const variants = {
      [NotificationStatus.DRAFT]: 'secondary',
      [NotificationStatus.SCHEDULED]: 'default',
      [NotificationStatus.SENT]: 'success',
      [NotificationStatus.REVOKED]: 'destructive',
    } as const;

    const labels = {
      [NotificationStatus.DRAFT]: 'Nháp',
      [NotificationStatus.SCHEDULED]: 'Đã lên lịch',
      [NotificationStatus.SENT]: 'Đã gửi',
      [NotificationStatus.REVOKED]: 'Đã thu hồi',
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
      low: 'Thấp',
      normal: 'Bình thường',
      high: 'Cao',
      critical: 'Khẩn cấp',
    };

    return (
      <Badge variant={variants[priority] as any}>{labels[priority]}</Badge>
    );
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels = {
      [NotificationType.GENERAL]: 'Tổng quát',
      [NotificationType.ACADEMIC]: 'Học tập',
      [NotificationType.EVENT]: 'Sự kiện',
      [NotificationType.SYSTEM]: 'Hệ thống',
      [NotificationType.URGENT]: 'Khẩn cấp',
    };
    return labels[type];
  };

  const getTargetTypeLabel = (targetType: NotificationTargetType) => {
    const labels = {
      [NotificationTargetType.ALL_STUDENTS]: 'Tất cả sinh viên',
      [NotificationTargetType.SPECIFIC_STUDENTS]: 'Sinh viên cụ thể',
      [NotificationTargetType.BY_CLASS]: 'Theo lớp',
      [NotificationTargetType.BY_MAJOR]: 'Theo ngành',
    };
    return labels[targetType];
  };

  // Fetch students with React Query
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await studentApi.getStudents();
      return response.items || [];
    },
  });

  const getReadByStudents = () => {
    if (!notification.readBy) return [];
    return students.filter((student: Student) =>
      notification.readBy?.includes(student.id)
    );
  };

  const readByStudents = getReadByStudents();
  const readRate =
    notification.readBy && students.length > 0
      ? Math.round((notification.readBy.length / students.length) * 100)
      : 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          {getStatusBadge(notification.status)}
          {getPriorityBadge(notification.priority)}
          <Badge variant='outline'>{getTypeLabel(notification.type)}</Badge>
        </div>
        <h2 className='text-xl font-semibold'>{notification.title}</h2>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Nội dung thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='prose prose-sm max-w-none'>
            <p className='whitespace-pre-wrap'>{notification.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <span className='font-medium'>Loại thông báo:</span>
              <span className='ml-2'>{getTypeLabel(notification.type)}</span>
            </div>
            <div>
              <span className='font-medium'>Độ ưu tiên:</span>
              <span className='ml-2'>
                {getPriorityBadge(notification.priority)}
              </span>
            </div>
            <div>
              <span className='font-medium'>Đối tượng:</span>
              <span className='ml-2'>
                {getTargetTypeLabel(notification.targetType)}
              </span>
            </div>
            <div>
              <span className='font-medium'>Người tạo:</span>
              <span className='ml-2'>{notification.createdBy}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thời gian</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <span className='font-medium'>Ngày tạo:</span>
              <span className='ml-2'>
                {DateTime.fromISO(notification.createdAt).toFormat(
                  'dd/MM/yyyy HH:mm'
                )}
              </span>
            </div>
            {notification.scheduledAt && (
              <div>
                <span className='font-medium'>Lên lịch:</span>
                <span className='ml-2'>
                  {DateTime.fromISO(notification.scheduledAt).toFormat(
                    'dd/MM/yyyy HH:mm'
                  )}
                </span>
              </div>
            )}
            {notification.sentAt && (
              <div>
                <span className='font-medium'>Đã gửi:</span>
                <span className='ml-2'>
                  {DateTime.fromISO(notification.sentAt).toFormat(
                    'dd/MM/yyyy HH:mm'
                  )}
                </span>
              </div>
            )}
            {notification.revokedAt && (
              <div>
                <span className='font-medium'>Thu hồi:</span>
                <span className='ml-2 text-red-600'>
                  {DateTime.fromISO(notification.revokedAt).toFormat(
                    'dd/MM/yyyy HH:mm'
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Target Details */}
      {notification.targetIds && notification.targetIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Đối tượng cụ thể</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {notification.targetIds.map((targetId) => (
                <Badge key={targetId} variant='outline'>
                  {targetId}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Read Statistics */}
      {notification.status === NotificationStatus.SENT && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê đọc</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>Tỷ lệ đã đọc:</span>
              <span className='text-lg font-bold text-blue-600'>
                {readRate}%
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>Số lượng đã đọc:</span>
              <span>
                {notification.readBy?.length || 0} / {students.length}
              </span>
            </div>

            {isLoadingStudents ? (
              <div>
                <Separator className='my-3' />
                <div className='flex items-center justify-center py-4'>
                  <div className='animate-spin h-5 w-5 border-t-2 border-b-2 border-primary rounded-full mr-2'></div>
                  <span>Đang tải thông tin sinh viên...</span>
                </div>
              </div>
            ) : (
              readByStudents.length > 0 && (
                <div>
                  <Separator className='my-3' />
                  <div className='space-y-2'>
                    <span className='font-medium'>Sinh viên đã đọc:</span>
                    <div className='max-h-32 overflow-y-auto'>
                      {readByStudents.map((student: Student) => (
                        <div
                          key={student.id}
                          className='text-sm text-muted-foreground'
                        >
                          • {student.firstName} {student.lastName} (
                          {student.email})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {notification.metadata &&
        Object.keys(notification.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className='flex items-center'>
                    <span className='font-medium capitalize'>
                      {key.replace('_', ' ')}:
                    </span>
                    <span className='ml-2 text-sm'>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Actions */}
      <div className='flex justify-end'>
        <Button onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}
