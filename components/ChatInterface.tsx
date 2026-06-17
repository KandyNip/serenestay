'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Send, MessageCircle, Sparkles, ChevronDown, Lock, Zap } from 'lucide-react';
import { Message, Destination } from '@/lib/types';
import { streamChat, getRemainingMatches, incrementMatchCount, checkProStatus } from '@/lib/api';
import DestinationChatCard from '@/components/DestinationChatCard';

// Quick reply suggestions
const quickReplies = [
  { label: '🌿 Looking for peace and quiet', message: 'Looking for peace and quiet' },
  { label: '🏖️ Beach and nature combined', message: 'Beach and nature combined' },
  { label: '🏔️ Mountain retreat vibes', message: 'Mountain retreat vibes' },
  { label: '💼 Good WiFi for remote work', message: 'Good WiFi for remote work' },
  { label: '💰 Budget-friendly option', message: 'Budget-friendly option' },
  { label: '🧘 Focus on wellness', message: 'Focus on wellness' },
];

// Pro-exclusive emotion quick replies
const emotionQuickReplies = [
  { label: '😰 Stressed & Overwhelmed', description: 'Need to decompress and slow down', message: 'I\'m feeling really stressed and overwhelmed lately' },
  { label: '🔥 Burnt Out & Exhausted', description: 'Running on empty, need deep recharge', message: 'I\'m completely burnt out and exhausted' },
  { label: '💙 Lonely & Disconnected', description: 'Craving meaningful connection', message: 'I\'m feeling lonely and disconnected' },
  { label: '🌀 Anxious & Restless', description: 'Can\'t settle, need calm and grounding', message: 'I\'ve been feeling anxious and restless' },
  { label: '🔮 Lost & Seeking Purpose', description: 'Searching for direction and meaning', message: 'I feel lost and I\'m seeking purpose and direction' },
  { label: '💔 Grieving & Heartbroken', description: 'Need space to process and heal', message: 'I\'m going through grief and need healing' },
];

interface ChatInterfaceProps {
  initialMessages?: Message[];
  destinationContext?: string;
  destinationName?: string;
  isProUser?: boolean;
  onMatchCountChange?: (count: number) => void;
}

export default function ChatInterface({
  initialMessages = [],
  destinationContext,
  destinationName,
  isProUser: initialIsProUser = false,
  onMatchCountChange,
}: ChatInterfaceProps) {
  // State management
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [matchCount, setMatchCount] = useState(0); // will be set from localStorage in useEffect
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isProUser, setIsProUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('serenestay_pro_token');
    }
    return false;
  });
  const [chatDisabled, setChatDisabled] = useState(false); // will be set from localStorage in useEffect
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasAutoTriggeredRef = useRef(false);
  const isAutoTriggerRef = useRef(false);

  // Cache all destinations for chat card rendering
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  useEffect(() => {
    fetch('/api/destinations?fields=card')
      .then((r) => r.json())
      .then((data: { destinations: Destination[] }) => setAllDestinations(data.destinations || []))
      .catch(() => {});
  }, []);

  // Welcome message
  const displayName = destinationName || destinationContext || '';
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: destinationContext
      ? `Let me tell you about ${displayName} ✨`
      : isProUser
        ? `Hello! I'm Serene, your personal wellness travel guide ✨ I'll help you find a healing retreat that's truly matched to how you're feeling — not just a popular destination, but one that speaks to YOUR needs.\n\nTo give you the most personalized recommendation, I'd love to understand you better. Tap one of the emotion cards below to get started, or simply tell me what's on your mind 💫`
        : `Hello! I'm Serene, your AI wellness travel guide. 🌿 I'm here to help you find the perfect healing retreat that matches your needs and dreams.

What matters most to you in a wellness destination? You can tell me about:
• Your budget and preferred climate
• Activities like yoga, meditation, or nature walks
• Need for good WiFi or remote work conditions
• Any health or medical considerations

Or just share what's on your mind, and we'll explore together.`,
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  // Check localStorage for user status on mount
  useEffect(() => {
    const isPro = checkProStatus();
    setIsProUser(isPro);

    if (!isPro) {
      const used = parseInt(localStorage.getItem('serenestay_matches_used') || '0', 10);
      setMatchCount(used);
      if (used >= 2) {
        setShowUpgradePrompt(true);
        setChatDisabled(true);
      }
    }
  }, []);

  // Track if user is near bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider "near bottom" if within 100px of the bottom
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to bottom on new messages (only if user is near bottom)
  // Use scrollTop instead of scrollIntoView to avoid scrolling outer page/body
  useEffect(() => {
    if (!isNearBottomRef.current) return;
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-trigger AI response when destination context is provided
  useEffect(() => {
    if (destinationContext && !hasAutoTriggeredRef.current && messages.length <= 1) {
      hasAutoTriggeredRef.current = true;
      isAutoTriggerRef.current = true; // mark this as auto-trigger (free, no count)
      handleStreamResponse(
        `I'm interested in ${destinationName || destinationContext}. Please give me a detailed overview based on the 9-dimension scoring, highlights, and practical info.`
      );
    }
  }, [destinationContext, destinationName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle streaming response
  const handleStreamResponse = useCallback(async (userMessage: string) => {
    setIsStreaming(true);
    
    // Create a placeholder for the AI response
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    let fullResponse = '';

    try {
      // Read Pro token from localStorage
      const proToken = typeof window !== 'undefined'
        ? localStorage.getItem('serenestay_pro_token') || undefined
        : undefined;

      await streamChat(
        [...messages, { id: 'current', role: 'user' as const, content: userMessage }],
        (chunk) => {
          fullResponse += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (done) => {
          if (done) {
            // Auto-triggered destination overview is FREE — doesn't count toward limit
            if (!isProUser && !isAutoTriggerRef.current) {
              const newUsed = incrementMatchCount();
              setMatchCount(newUsed);
              onMatchCountChange?.(newUsed);
              if (newUsed >= 2) {
                setShowUpgradePrompt(true);
                setChatDisabled(true);
              }
            }
            // Reset flag after response completes
            isAutoTriggerRef.current = false;
          }
        },
        isProUser,
        proToken
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to reach out to us directly.'
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isProUser, onMatchCountChange]);

  // Handle send message
  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isStreaming) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Trigger AI response
    await handleStreamResponse(trimmedInput);
  };

  // Handle quick reply click
  const handleQuickReply = async (reply: { label: string; message: string }) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: reply.message,
    };

    setMessages((prev) => [...prev, userMessage]);
    await handleStreamResponse(reply.message);
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle upgrade prompt
  const toggleUpgradePrompt = () => {
    setShowUpgradePrompt(!showUpgradePrompt);
  };

  // Parse [DEST:slug] and [EMATCH:slug:reason] markers and render destination cards
  const renderMessageContent = (content: string, isLastAndStreaming: boolean) => {
    const parts = content.split(/(\[DEST:[\w-]+\]|\[EMATCH:[\w-]+:[^\]]+\])/g);
    return parts.map((part, i) => {
      // Check for emotional match marker [EMATCH:slug:match_text]
      const ematchMatch = part.match(/\[EMATCH:([\w-]+):([^\]]+)\]/);
      if (ematchMatch) {
        const slug = ematchMatch[1];
        const matchText = ematchMatch[2];
        const dest = allDestinations.find((d) => d.slug === slug);
        if (dest) {
          return <DestinationChatCard key={`card-${i}`} dest={dest} emotionMatch={matchText} />;
        }
        return null;
      }

      // Check for regular destination marker [DEST:slug]
      const match = part.match(/\[DEST:([\w-]+)\]/);
      if (match) {
        const slug = match[1];
        const dest = allDestinations.find((d) => d.slug === slug);
        if (dest) {
          return <DestinationChatCard key={`card-${i}`} dest={dest} />;
        }
        // Fallback: show as text link if destination not found in cache
        return (
          <Link key={`link-${i}`} href={`/destinations/${slug}`} className="text-secondary underline font-medium">
            View {slug} →
          </Link>
        );
      }
      return part ? (
        <span key={`text-${i}`} className="whitespace-pre-wrap leading-relaxed">{part}</span>
      ) : null;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-primary/10">
        <div className="flex items-center gap-3">
          {/* Serene Avatar */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-secondary rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-primary">Serene</h2>
            <p className="text-xs text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse-soft" />
              AI Wellness Guide
            </p>
          </div>
        </div>

        {/* Match Count & Upgrade */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-primary/50">Your matches</p>
            <p className="font-mono text-sm font-semibold text-primary">
              {matchCount} {isProUser ? '∞' : `/ 2`}
            </p>
          </div>
          
          {!isProUser && (
            <button
              onClick={toggleUpgradePrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-white text-xs font-medium rounded-full hover:bg-gold-600 transition-colors"
              aria-label="Upgrade to Pro"
            >
              <Lock className="w-3 h-3" />
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Prompt Banner */}
      {showUpgradePrompt && !isProUser && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-gold-100 to-surface rounded-xl border border-gold/30 animate-slide-down">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-primary">Unlock Unlimited Matches</h4>
              <p className="mt-1 text-sm text-primary/70">
                You&apos;ve used your free matches. Upgrade to Pro for unlimited AI-powered matching, 
                detailed insights, and exclusive destination guides.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-gold text-white text-sm font-medium rounded-lg hover:bg-gold-600 transition-colors"
                >
                  View Pro Plans
                </Link>
                <button
                  onClick={toggleUpgradePrompt}
                  className="px-4 py-2 text-sm text-primary/60 hover:text-primary transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-secondary text-white rounded-br-md'
                    : 'bg-white text-primary shadow-card rounded-bl-md'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-secondary/70">
                    <Sparkles className="w-3 h-3" />
                    <span>Serene</span>
                  </div>
                )}
                <div className="leading-relaxed">
                  {renderMessageContent(message.content, message.id === messages[messages.length - 1]?.id && isStreaming)}
                  {message.id === messages[messages.length - 1]?.id && isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-secondary/50 animate-pulse-soft" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            {isProUser && (
              <p className="text-xs text-primary/40 mb-3 text-center font-medium">
                ✨ How are you feeling? Tap a card to start your personalized healing journey
              </p>
            )}
            {isProUser ? (
              /* Pro: Emotion cards — larger, more prominent */
              <div className="grid grid-cols-2 gap-2 pb-2">
                {emotionQuickReplies.map((reply) => (
                  <button
                    key={reply.message}
                    onClick={() => handleQuickReply(reply)}
                    className="flex flex-col items-start px-4 py-3 bg-white border border-primary/10 rounded-xl text-left hover:border-purple-300 hover:shadow-md transition-all group"
                    disabled={isStreaming || chatDisabled}
                  >
                    <span className="text-sm font-medium text-primary/80 group-hover:text-purple-600 transition-colors">
                      {reply.label}
                    </span>
                    <span className="text-xs text-primary/40 mt-0.5 group-hover:text-purple-400 transition-colors">
                      {reply.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* Free: Simple pill buttons */
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.message}
                    onClick={() => handleQuickReply(reply)}
                    className="flex-shrink-0 px-4 py-2 bg-white border border-primary/10 rounded-full text-sm text-primary/70 hover:border-secondary hover:text-secondary transition-colors whitespace-nowrap"
                    disabled={isStreaming || chatDisabled}
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-4 bg-white border-t border-primary/10">
        {chatDisabled && !isProUser && (
          <div className="max-w-3xl mx-auto pb-3 text-center">
            <p className="text-sm text-primary/70">
              You&apos;ve used your 2 free AI matches.{' '}
              <Link href="/pricing" className="text-secondary font-medium hover:underline">
                Upgrade to Pro
              </Link>{' '}
              for unlimited conversations.
            </p>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your wellness dreams..."
              className="flex-1 px-4 py-3 bg-surface border border-primary/10 rounded-xl text-primary placeholder-primary/40 resize-none focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
              rows={1}
              maxLength={500}
              aria-label="Type your message"
              disabled={isStreaming || chatDisabled}
              style={{
                maxHeight: '120px',
                minHeight: '48px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming || chatDisabled}
              className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-xl hover:bg-secondary-600 disabled:bg-primary/20 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className={`w-5 h-5 ${isStreaming ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          
          <p className="mt-2 text-center text-xs text-primary/40">
            Serene AI may make mistakes. Consider important decisions carefully.
          </p>
        </div>
      </div>
    </div>
  );
}
