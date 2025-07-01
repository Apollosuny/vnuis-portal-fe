'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ChatbotMessage } from '@/api/chatbot.api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import { TypingText } from './TypingText';
import { useChatbot } from '@/hooks/useChatbot';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  suggestedLinks?: ChatbotMessage['suggestedLinks'];
  quickActions?: ChatbotMessage['quickActions'];
  isTyping?: boolean;
  showTypingAnimation?: boolean;
}

// Move TypingAnimation outside to prevent re-creation
const TypingAnimation: React.FC = () => (
  <div className='flex items-center space-x-1'>
    <div className='flex space-x-1'>
      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
      <div
        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
        style={{ animationDelay: '0.1s' }}
      ></div>
      <div
        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
        style={{ animationDelay: '0.2s' }}
      ></div>
    </div>
  </div>
);

// Move MessageBubble outside and memoize it to prevent unnecessary re-renders
const MessageBubble: React.FC<{
  message: Message;
  onTypingComplete: (messageId: string) => void;
  onContentChange?: () => void;
}> = React.memo(({ message, onTypingComplete, onContentChange }) => {
  // Scroll when suggested links appear
  useEffect(() => {
    if (
      message.suggestedLinks &&
      message.suggestedLinks.length > 0 &&
      !message.showTypingAnimation
    ) {
      onContentChange?.();
    }
  }, [message.suggestedLinks, message.showTypingAnimation, onContentChange]);

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        message.type === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.type === 'bot' && (
        <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0'>
          <Bot className='w-4 h-4 text-white' />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          message.type === 'user'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-900'
        )}
      >
        {message.isTyping ? (
          <TypingAnimation />
        ) : message.showTypingAnimation ? (
          <TypingText
            text={message.content}
            speed={30}
            onComplete={() => onTypingComplete(message.id)}
            className='text-sm'
          />
        ) : (
          <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
        )}

        {/* Suggested Links - Only show after typing is complete */}
        {message.suggestedLinks &&
          message.suggestedLinks.length > 0 &&
          !message.showTypingAnimation && (
            <div className='mt-3 space-y-2 animate-in fade-in duration-500'>
              <p className='text-xs text-gray-500'>Có thể bạn quan tâm:</p>
              <div className='flex flex-wrap gap-2'>
                {message.suggestedLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(link.route, '_blank');
                    }}
                    className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors'
                  >
                    <ExternalLink className='w-3 h-3' />
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>

      {message.type === 'user' && (
        <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0'>
          <User className='w-4 h-4 text-gray-600' />
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { processMessage, isLoading, error } = useChatbot();

  // Auto-scroll function with smooth behavior
  const scrollToBottom = useCallback(
    (behavior: 'smooth' | 'instant' = 'smooth') => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior,
          block: 'end',
          inline: 'nearest',
        });
      }
    },
    []
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, scrollToBottom]);

  // Auto-scroll during typing animation - check periodically
  useEffect(() => {
    const hasTypingMessage = messages.some(
      (msg) => msg.showTypingAnimation || msg.isTyping
    );

    if (hasTypingMessage) {
      const intervalId = setInterval(() => {
        scrollToBottom('smooth');
      }, 500); // Check and scroll every 500ms during typing

      return () => clearInterval(intervalId);
    }
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content:
            'Xin chào! Tôi là trợ lý ảo của hệ thống. Tôi có thể giúp bạn với các vấn đề về đặt phòng, sự kiện, đơn hành chính và nhiều thứ khác. Bạn cần gì?',
          suggestedLinks: [
            {
              name: 'Đặt phòng',
              route: '/student-dashboard/rooms',
              description: 'Đặt phòng học, phòng họp',
            },
            {
              name: 'Xem sự kiện',
              route: '/student-dashboard/events',
              description: 'Xem và đăng ký sự kiện',
            },
            {
              name: 'Nộp đơn',
              route: '/student-dashboard/forms',
              description: 'Nộp đơn hành chính',
            },
          ],
          showTypingAnimation: true,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    };

    // Sinh 1 id duy nhất cho cặp bot message này
    const botId = `bot-${Date.now()}`;

    // Thêm message của user vào trước
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Scroll ngay sau khi thêm user message
    setTimeout(() => scrollToBottom('smooth'), 50);

    // Thêm message bot với trạng thái isTyping/loading NGAY LẬP TỨC, dùng botId
    const typingMessage: Message = {
      id: botId,
      type: 'bot',
      content: '',
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    // Scroll ngay sau khi thêm typing message
    setTimeout(() => scrollToBottom('smooth'), 100);

    try {
      const response = await processMessage(message);

      // Nếu intent là 'conversation' hoặc 'help', KHÔNG hiển thị suggestedLinks
      const shouldShowSuggestedLinks =
        response &&
        response.intent !== 'conversation' &&
        response.intent !== 'help';

      // Update message bot với cùng id, KHÔNG tạo id mới
      const botMessage: Message = {
        id: botId,
        type: 'bot',
        content: response
          ? response.message
          : error || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        suggestedLinks:
          response && shouldShowSuggestedLinks ? response.suggestedLinks : [],
        showTypingAnimation: true,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === botId ? botMessage : msg))
      );
    } catch (error) {
      const errorMessage: Message = {
        id: botId,
        type: 'bot',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        showTypingAnimation: true,
      };
      setMessages((prev) =>
        prev.map((msg) => (msg.id === botId ? errorMessage : msg))
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleLinkClick = (route: string) => {
    // Open link in new tab
    window.open(route, '_blank');
  };

  const handleQuickActionClick = (action: any) => {
    if (action.action === 'navigate' && action.route) {
      window.open(action.route, '_blank');
    } else if (action.action === 'external' && action.url) {
      window.open(action.url, '_blank');
    }
  };

  // Use useCallback to prevent function recreation on every render
  const handleTypingComplete = useCallback(
    (messageId: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, showTypingAnimation: false } : msg
        )
      );
      // Scroll after typing is complete and suggested links might appear
      setTimeout(() => scrollToBottom('smooth'), 300);
    },
    [scrollToBottom]
  );

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {/* Overlay khi maximize */}
      {isOpen && isMaximized && (
        <div
          className='fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-all duration-300'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 transition-all duration-300',
          isOpen && 'scale-90'
        )}
      >
        {isOpen ? (
          <X className='w-6 h-6' />
        ) : (
          <MessageCircle className='w-6 h-6' />
        )}
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div
          className={cn(
            'z-50 bg-white rounded-lg border flex flex-col transition-all duration-500',
            isMaximized
              ? 'fixed top-1/2 left-1/2 w-[80vw] h-[80vh] max-w-[900px] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 scale-105 shadow-2xl'
              : 'absolute bottom-16 right-0 w-[420px] h-[600px] scale-100 shadow-xl'
          )}
          style={{ transition: 'all 0.5s cubic-bezier(.4,2,.6,1)' }}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg'>
            <div className='flex items-center gap-2'>
              <Bot className='w-5 h-5' />
              <h3 className='font-semibold'>Trợ lý ảo</h3>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setIsMaximized((v) => !v)}
                className='hover:bg-white/20 rounded-full p-1 transition-colors'
                title={isMaximized ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isMaximized ? (
                  <Minimize2 className='w-4 h-4' />
                ) : (
                  <Maximize2 className='w-4 h-4' />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className='hover:bg-white/20 rounded-full p-1 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className='flex-1 p-4 overflow-y-auto scroll-smooth'
            style={{ height: isMaximized ? undefined : '420px' }}
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onTypingComplete={handleTypingComplete}
                onContentChange={() =>
                  setTimeout(() => scrollToBottom('smooth'), 200)
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className='p-4 border-t'>
            <form onSubmit={handleSubmit} className='flex gap-2'>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Nhập tin nhắn...'
                disabled={isLoading}
                className='flex-1'
              />
              <Button
                type='submit'
                size='sm'
                disabled={isLoading || !inputValue.trim()}
                className='px-3'
              >
                <Send className='w-4 h-4' />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
