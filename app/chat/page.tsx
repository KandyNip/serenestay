'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatInterface from '@/components/ChatInterface';

function ChatContent() {
  const searchParams = useSearchParams();
  const destinationContext = searchParams.get('context') || undefined;

  // Lock body scroll on chat page so only the chat container scrolls
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="pt-16">
      <ChatInterface destinationContext={destinationContext} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
