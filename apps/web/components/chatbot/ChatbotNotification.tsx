'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface ChatbotNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenChat: () => void;
  message?: string;
}

export const ChatbotNotification: React.FC<ChatbotNotificationProps> = ({
  isVisible,
  onClose,
  onOpenChat,
  message = 'Có tin nhắn mới từ trợ lý ảo!',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className='fixed bottom-20 right-4 z-40'>
      <div
        className={cn(
          'bg-white rounded-lg shadow-lg border p-4 max-w-xs slide-in-from-bottom',
          isAnimating && 'scale-in'
        )}
      >
        <div className='flex items-start gap-3'>
          <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0'>
            <MessageCircle className='w-4 h-4 text-white' />
          </div>

          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-gray-900 mb-1'>Trợ lý ảo</p>
            <p className='text-xs text-gray-600 mb-3'>{message}</p>

            <div className='flex gap-2'>
              <button
                onClick={onOpenChat}
                className='px-3 py-1 text-xs bg-primary text-white rounded-full hover:bg-primary/90 transition-colors'
              >
                Xem tin nhắn
              </button>
              <button
                onClick={onClose}
                className='px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors'
              >
                Đóng
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};
