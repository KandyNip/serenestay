'use client';

import { useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  // Lock body scroll on chat page so only the chat container scrolls
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="pt-16">
      <ChatInterface />
    </div>
  );
}
