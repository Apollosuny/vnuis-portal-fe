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
  const [isOpen, setIsOpen] = useState(false);
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
    <div className='fixed bottom-4 right-4 z-50'>
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
        <div className='absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-xl border animate-in slide-in-from-bottom-2 duration-300'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg'>
            <div className='flex items-center gap-2'>
              <Bot className='w-5 h-5' />
              <h3 className='font-semibold'>Trợ lý ảo</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className='hover:bg-white/20 rounded-full p-1 transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 p-4 overflow-y-auto h-[380px]'>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
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
