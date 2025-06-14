'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DateTime } from 'luxon';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationTargetType,
} from '@/types/notification.types';
import { mockStudents, mockClasses, mockMajors } from '../mock-data';
import { useState } from 'react';

interface FormData {
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: NotificationTargetType;
  scheduledAt?: string;
}

const schema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  content: yup
    .string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content must not exceed 2000 characters'),
  type: yup
    .string()
    .oneOf(Object.values(NotificationType))
    .required('Notification type is required'),
  priority: yup
    .string()
    .oneOf(Object.values(NotificationPriority))
    .required('Priority is required'),
  targetType: yup
    .string()
    .oneOf(Object.values(NotificationTargetType))
    .required('Target type is required'),
  scheduledAt: yup.string().optional(),
});

interface NotificationFormProps {
  notification?: Notification | null;
  onSubmit: (data: Partial<Notification>) => void;
  onCancel: () => void;
}

export function NotificationForm({
  notification,
  onSubmit,
  onCancel,
}: NotificationFormProps) {
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(
    notification?.targetIds || []
  );
  const [isScheduled, setIsScheduled] = useState(!!notification?.scheduledAt);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: notification?.title || '',
      content: notification?.content || '',
      type: notification?.type || NotificationType.GENERAL,
      priority: notification?.priority || NotificationPriority.NORMAL,
      targetType:
        notification?.targetType || NotificationTargetType.ALL_STUDENTS,
      scheduledAt: notification?.scheduledAt
        ? DateTime.fromISO(notification.scheduledAt).toFormat(
            "yyyy-MM-dd'T'HH:mm"
          )
        : '',
    },
  });

  const watchedTargetType = watch('targetType');
  const watchedType = watch('type');

  const handleFormSubmit = (data: any) => {
    const formattedData: Partial<Notification> = {
      ...data,
      targetIds: selectedTargetIds.length > 0 ? selectedTargetIds : undefined,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt).toISOString()
        : undefined,
    };

    onSubmit(formattedData);
  };

  const handleTargetChange = (targetId: string, checked: boolean) => {
    if (checked) {
      setSelectedTargetIds((prev) => [...prev, targetId]);
    } else {
      setSelectedTargetIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const getTargetOptions = () => {
    switch (watchedTargetType) {
      case NotificationTargetType.SPECIFIC_STUDENTS:
        return mockStudents.map((student) => ({
          id: student.id,
          label: `${student.name} (${student.email})`,
          value: student.id,
        }));
      case NotificationTargetType.BY_CLASS:
        return mockClasses.map((cls) => ({
          id: cls.id,
          label: `${cls.name} (${cls.studentCount} sinh viên)`,
          value: cls.id,
        }));
      case NotificationTargetType.BY_MAJOR:
        return mockMajors.map((major) => ({
          id: major.id,
          label: `${major.name} (${major.studentCount} sinh viên)`,
          value: major.id,
        }));
      default:
        return [];
    }
  };

  const targetOptions = getTargetOptions();
  const showTargetSelection =
    watchedTargetType !== NotificationTargetType.ALL_STUDENTS;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Tiêu đề *</Label>
            <Input
              id='title'
              {...register('title')}
              placeholder='Nhập tiêu đề thông báo...'
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Nội dung *</Label>
            <Textarea
              id='content'
              {...register('content')}
              placeholder='Nhập nội dung thông báo...'
              rows={6}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className='text-sm text-red-500'>{errors.content.message}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='type'>Loại thông báo *</Label>
              <Select
                value={watchedType}
                onValueChange={(value) =>
                  setValue('type', value as NotificationType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn loại thông báo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NotificationType.GENERAL}>
                    Tổng quát
                  </SelectItem>
                  <SelectItem value={NotificationType.ACADEMIC}>
                    Học tập
                  </SelectItem>
                  <SelectItem value={NotificationType.EVENT}>
                    Sự kiện
                  </SelectItem>
                  <SelectItem value={NotificationType.SYSTEM}>
                    Hệ thống
                  </SelectItem>
                  <SelectItem value={NotificationType.URGENT}>
                    Khẩn cấp
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className='text-sm text-red-500'>{errors.type.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>Độ ưu tiên *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) =>
                  setValue('priority', value as NotificationPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn độ ưu tiên' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NotificationPriority.LOW}>Thấp</SelectItem>
                  <SelectItem value={NotificationPriority.NORMAL}>
                    Bình thường
                  </SelectItem>
                  <SelectItem value={NotificationPriority.HIGH}>Cao</SelectItem>
                  <SelectItem value={NotificationPriority.CRITICAL}>
                    Khẩn cấp
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className='text-sm text-red-500'>
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Đối tượng nhận thông báo</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='targetType'>Loại đối tượng *</Label>
            <Select
              value={watchedTargetType}
              onValueChange={(value) => {
                setValue('targetType', value as NotificationTargetType);
                setSelectedTargetIds([]); // Reset selected targets when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Chọn đối tượng' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NotificationTargetType.ALL_STUDENTS}>
                  Tất cả sinh viên
                </SelectItem>
                <SelectItem value={NotificationTargetType.SPECIFIC_STUDENTS}>
                  Sinh viên cụ thể
                </SelectItem>
                <SelectItem value={NotificationTargetType.BY_CLASS}>
                  Theo lớp
                </SelectItem>
                <SelectItem value={NotificationTargetType.BY_MAJOR}>
                  Theo ngành
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.targetType && (
              <p className='text-sm text-red-500'>
                {errors.targetType.message}
              </p>
            )}
          </div>

          {/* Target Selection Options */}
          {showTargetSelection && (
            <div className='space-y-3'>
              <Label>
                Chọn{' '}
                {watchedTargetType === NotificationTargetType.SPECIFIC_STUDENTS
                  ? 'sinh viên'
                  : watchedTargetType === NotificationTargetType.BY_CLASS
                    ? 'lớp'
                    : 'ngành'}
              </Label>
              <div className='max-h-48 overflow-y-auto border rounded-md p-3 space-y-2'>
                {targetOptions.map((option) => (
                  <div key={option.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={option.id}
                      checked={selectedTargetIds.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleTargetChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={option.id}
                      className='text-sm cursor-pointer'
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedTargetIds.length > 0 && (
                <div className='space-y-2'>
                  <Label>Đã chọn ({selectedTargetIds.length}):</Label>
                  <div className='flex flex-wrap gap-2'>
                    {selectedTargetIds.map((targetId) => {
                      const option = targetOptions.find(
                        (opt) => opt.value === targetId
                      );
                      return (
                        <Badge key={targetId} variant='secondary'>
                          {option?.label || targetId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Lên lịch gửi</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='isScheduled'
              checked={isScheduled}
              onCheckedChange={(checked) => {
                setIsScheduled(checked as boolean);
                if (!checked) {
                  setValue('scheduledAt', '');
                }
              }}
            />
            <Label htmlFor='isScheduled'>Lên lịch gửi thông báo</Label>
          </div>

          {isScheduled && (
            <div className='space-y-2'>
              <Label htmlFor='scheduledAt'>Thời gian gửi</Label>
              <Input
                id='scheduledAt'
                type='datetime-local'
                {...register('scheduledAt')}
                min={DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm")}
                className={errors.scheduledAt ? 'border-red-500' : ''}
              />
              {errors.scheduledAt && (
                <p className='text-sm text-red-500'>
                  {errors.scheduledAt.message}
                </p>
              )}
              <p className='text-sm text-muted-foreground'>
                Để trống để gửi ngay lập tức sau khi tạo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end space-x-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Hủy
        </Button>
        <Button type='submit'>
          {notification ? 'Cập nhật' : 'Tạo thông báo'}
        </Button>
      </div>
    </form>
  );
}
