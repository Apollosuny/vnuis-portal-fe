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
import { useEffect, useState } from 'react';

interface NotificationDetailProps {
  notification: Notification;
  onClose: () => void;
}

// Hàm tiện ích để chuẩn hóa dữ liệu thông báo
const normalizeNotification = (notification: Notification): Notification => {
  // Đảm bảo type có giá trị hợp lệ và ở dạng chữ hoa
  let type = notification.type;
  if (type && typeof type === 'string') {
    type = type.toUpperCase() as NotificationType;
    if (!Object.values(NotificationType).includes(type)) {
      type = NotificationType.GENERAL;
    }
  } else {
    type = NotificationType.GENERAL;
  }

  // Đảm bảo priority có giá trị hợp lệ và ở dạng chữ hoa
  let priority = notification.priority;
  if (priority && typeof priority === 'string') {
    priority = priority.toUpperCase() as NotificationPriority;
    if (!Object.values(NotificationPriority).includes(priority)) {
      priority = NotificationPriority.NORMAL;
    }
  } else {
    priority = NotificationPriority.NORMAL;
  }

  // Đảm bảo status có giá trị hợp lệ và ở dạng chữ hoa
  let status = notification.status;
  if (status && typeof status === 'string') {
    status = status.toUpperCase() as NotificationStatus;
    if (!Object.values(NotificationStatus).includes(status)) {
      status = NotificationStatus.DRAFT;
    }
  } else {
    status = NotificationStatus.DRAFT;
  }

  // Đảm bảo targetType có giá trị hợp lệ và ở dạng chữ hoa
  let targetType = notification.targetType;
  if (targetType && typeof targetType === 'string') {
    targetType = targetType.toUpperCase() as NotificationTargetType;
    if (!Object.values(NotificationTargetType).includes(targetType)) {
      targetType = NotificationTargetType.ALL_STUDENTS;
    }
  } else {
    targetType = NotificationTargetType.ALL_STUDENTS;
  }

  // Đảm bảo createdBy được xử lý đúng cách
  const createdBy = notification.createdBy;

  return {
    ...notification,
    type,
    priority,
    status,
    targetType,
    // Đảm bảo createdBy luôn là một chuỗi hoặc đối tượng đã được kiểm tra
    createdBy: createdBy || 'Không xác định',
  };
};

export function NotificationDetail({
  notification: rawNotification,
  onClose,
}: NotificationDetailProps) {
  // Chuẩn hóa thông báo trước khi sử dụng
  const [notification, setNotification] = useState<Notification>(
    normalizeNotification(rawNotification)
  );

  useEffect(() => {
    // Cập nhật lại khi thông báo thay đổi
    setNotification(normalizeNotification(rawNotification));
  }, [rawNotification]);

  const getStatusBadge = (status: NotificationStatus) => {
    // Map uppercase DB values to our display values
    const statusMap: Record<string, { variant: string; label: string }> = {
      [NotificationStatus.DRAFT]: { variant: 'secondary', label: 'Nháp' },
      [NotificationStatus.SCHEDULED]: {
        variant: 'default',
        label: 'Đã lên lịch',
      },
      [NotificationStatus.SENT]: { variant: 'success', label: 'Đã gửi' },
      [NotificationStatus.REVOKED]: {
        variant: 'destructive',
        label: 'Đã thu hồi',
      },
    };

    // In case status is not a valid enum value
    if (!status || !Object.values(NotificationStatus).includes(status)) {
      console.warn(`Invalid status value in NotificationDetail: ${status}`);
      return <Badge variant='secondary'>Không xác định</Badge>;
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
      LOW: { variant: 'secondary', label: 'Thấp' },
      NORMAL: { variant: 'default', label: 'Bình thường' },
      HIGH: { variant: 'warning', label: 'Cao' },
      CRITICAL: { variant: 'destructive', label: 'Khẩn cấp' },
    };

    // In case priority is not a valid enum value
    if (!priority || !Object.values(NotificationPriority).includes(priority)) {
      console.warn(`Invalid priority value in NotificationDetail: ${priority}`);
      return <Badge variant='secondary'>Không xác định</Badge>;
    }

    const display = priorityMap[priority] || {
      variant: 'secondary',
      label: priority,
    };

    return <Badge variant={display.variant as any}>{display.label}</Badge>;
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels: Record<string, string> = {
      [NotificationType.GENERAL]: 'Tổng quát',
      [NotificationType.ACADEMIC]: 'Học tập',
      [NotificationType.EVENT]: 'Sự kiện',
      [NotificationType.SYSTEM]: 'Hệ thống',
      [NotificationType.URGENT]: 'Khẩn cấp',
    };

    // In case type is not a valid enum value
    if (!type || !Object.values(NotificationType).includes(type)) {
      console.warn(`Invalid type value in NotificationDetail: ${type}`);
      return 'Không xác định';
    }

    return labels[type] || 'Không xác định';
  };

  const getTargetTypeLabel = (targetType: NotificationTargetType) => {
    const labels: Record<string, string> = {
      [NotificationTargetType.ALL_STUDENTS]: 'Tất cả sinh viên',
      [NotificationTargetType.SPECIFIC_STUDENTS]: 'Sinh viên cụ thể',
      [NotificationTargetType.BY_CLASS]: 'Theo lớp',
      [NotificationTargetType.BY_MAJOR]: 'Theo ngành',
    };

    // In case targetType is not a valid enum value
    if (
      !targetType ||
      !Object.values(NotificationTargetType).includes(targetType)
    ) {
      console.warn(
        `Invalid targetType value in NotificationDetail: ${targetType}`
      );
      return 'Không xác định';
    }

    return labels[targetType] || 'Không xác định';
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

  // Hàm helper để hiển thị an toàn bất kỳ giá trị nào, bao gồm cả đối tượng
  const safeDisplayValue = (value: any): string => {
    if (value === null || value === undefined) return 'Không xác định';
    if (typeof value === 'object') {
      if ('username' in value) return value.username;
      if ('firstName' in value)
        return `${value.firstName} ${value.lastName || ''}`.trim();
      if ('name' in value) return value.name;
      if ('id' in value) return `ID: ${value.id}`;
      return JSON.stringify(value);
    }
    return String(value);
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
              <span className='ml-2'>
                {safeDisplayValue(notification.createdBy)}
              </span>
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
              {notification.targetIds.map((targetId, index) => (
                <Badge key={index} variant='outline'>
                  {safeDisplayValue(targetId)}
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
                      {safeDisplayValue(value)}
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
