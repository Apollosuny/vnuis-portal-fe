'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ExternalLink } from 'lucide-react';
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

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Default to closed
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { processMessage, isLoading, error } = useChatbot();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await processMessage(message);

      if (response) {
        // Add typing animation
        const typingMessage: Message = {
          id: `typing-${Date.now()}`,
          type: 'bot',
          content: '',
          isTyping: true,
        };

        setMessages((prev) => [...prev, typingMessage]);

        // Simulate typing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Replace typing message with actual response
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: response.message,
          suggestedLinks: response.suggestedLinks,
          quickActions: response.quickActions,
          showTypingAnimation: true,
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === typingMessage.id ? botMessage : msg))
        );
      } else {
        // Handle error response
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'bot',
          content: error || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
          showTypingAnimation: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        showTypingAnimation: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
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

  const handleTypingComplete = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, showTypingAnimation: false } : msg
      )
    );
  };

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

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
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
            onComplete={() => handleTypingComplete(message.id)}
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
                    onClick={() => handleLinkClick(link.route)}
                    className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors'
                  >
                    <ExternalLink className='w-3 h-3' />
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Quick Actions - Only show after typing is complete */}
        {message.quickActions &&
          message.quickActions.length > 0 &&
          !message.showTypingAnimation && (
            <div className='mt-3 space-y-2 animate-in fade-in duration-500'>
              <div className='flex flex-wrap gap-2'>
                {message.quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickActionClick(action)}
                    className='px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors'
                  >
                    {action.label}
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

  return (
    <div className='fixed right-0 top-0 z-40 h-screen'>
      {/* Chatbot toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-4 right-4 h-12 w-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all'
        aria-label='Toggle chat'
      >
        {isOpen ? (
          <X className='h-5 w-5' />
        ) : (
          <MessageCircle className='h-5 w-5' />
        )}
      </button>

      {/* Quick Info Panel */}
      <div
        className={cn(
          'h-full w-80 bg-white dark:bg-gray-900 border-l shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <Bot className='h-5 w-5 text-primary' />
            <h2 className='font-semibold text-lg'>Trợ lý ảo</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className='p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Chat area */}
        <div className='h-[calc(100vh-8rem)] overflow-y-auto p-4'>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className='absolute bottom-0 left-0 right-0 border-t p-4 bg-white dark:bg-gray-900'>
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
              <Send className='h-4 w-4' />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
