# Chatbot Components

Bộ component chatbot cho hệ thống VirtuUni Nexus, cung cấp trợ lý ảo cho sinh viên.

## Components

### ChatbotWidget

Component chính của chatbot, hiển thị dưới dạng floating button ở góc phải dưới màn hình.

**Features:**

- Icon floating ở góc phải dưới
- Chat interface với animation mượt mà
- Typing animation cho tin nhắn bot
- Suggested links với redirect sang \_blank
- Quick actions
- Auto-scroll và focus management

**Usage:**

```tsx
import { ChatbotWidget } from '@/components/chatbot';

// Trong component
<ChatbotWidget />;
```

### TypingText

Component hiển thị text với hiệu ứng typing từng ký tự.

**Props:**

- `text`: Nội dung text cần hiển thị
- `speed`: Tốc độ typing (ms, default: 30)
- `onComplete`: Callback khi typing hoàn thành
- `className`: CSS classes

**Usage:**

```tsx
import { TypingText } from '@/components/chatbot';

<TypingText
  text='Hello world!'
  speed={50}
  onComplete={() => console.log('Done!')}
/>;
```

### ChatbotNotification

Component thông báo khi có tin nhắn mới từ chatbot.

**Props:**

- `isVisible`: Hiển thị notification
- `onClose`: Callback khi đóng notification
- `onOpenChat`: Callback khi mở chat
- `message`: Nội dung thông báo

**Usage:**

```tsx
import { ChatbotNotification } from '@/components/chatbot';

<ChatbotNotification
  isVisible={showNotification}
  onClose={() => setShowNotification(false)}
  onOpenChat={() => setChatOpen(true)}
  message='Có tin nhắn mới!'
/>;
```

## Hooks

### useChatbot

Hook quản lý state và API calls cho chatbot.

**Returns:**

- `isLoading`: Trạng thái loading
- `error`: Lỗi nếu có
- `processMessage`: Function gửi tin nhắn
- `syncRoutes`: Function đồng bộ routes
- `getRoutes`: Function lấy routes
- `clearError`: Function xóa lỗi

**Usage:**

```tsx
import { useChatbot } from '@/hooks/useChatbot';

const { processMessage, isLoading, error } = useChatbot();
```

## API Integration

Chatbot sử dụng API endpoints:

- `POST /chatbot/process-message`: Xử lý tin nhắn
- `POST /chatbot/sync-routes`: Đồng bộ routes
- `GET /chatbot/routes`: Lấy danh sách routes
- `GET /chatbot/routes/by-category`: Lấy routes theo category

## Animations

Các animation được sử dụng:

- `slide-in-from-bottom`: Chat interface slide từ dưới lên
- `fade-in`: Links và actions fade in
- `scale-in`: Notification scale in
- `typing-cursor`: Cursor nhấp nháy khi typing

## Styling

Chatbot sử dụng Tailwind CSS với các class:

- `bg-primary`: Màu chủ đạo
- `text-white`: Text trắng
- `rounded-lg`: Bo góc
- `shadow-lg`: Shadow
- `transition-colors`: Transition cho hover effects

## Features

### Typing Animation

- Text hiển thị từng ký tự với tốc độ có thể điều chỉnh
- Cursor nhấp nháy trong quá trình typing
- Callback khi hoàn thành

### Link Handling

- Tất cả links mở trong tab mới (`_blank`)
- Suggested links với icon ExternalLink
- Quick actions với màu sắc khác nhau

### Responsive Design

- Chat interface responsive
- Floating button luôn hiển thị ở góc phải dưới
- Auto-scroll khi có tin nhắn mới

### Error Handling

- Hiển thị lỗi khi API call thất bại
- Retry mechanism
- User-friendly error messages

## Integration với Student Dashboard

Chatbot được tích hợp vào student dashboard:

```tsx
// apps/web/clients/student/dashboard/index.tsx
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';

const StudentDashboardPage: React.FC = () => {
  return (
    <>
      <StudentDashboardLayout>{getCurrentContent()}</StudentDashboardLayout>
      <ChatbotWidget />
    </>
  );
};
```
