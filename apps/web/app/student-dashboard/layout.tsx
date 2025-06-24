import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  );
}
