'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Send, Leaf, Lock, RotateCcw, Compass, BatteryLow, Wind, Users, Heart } from 'lucide-react';
import { Message, Destination } from '@/lib/types';
import { streamChat, checkProStatus } from '@/lib/api';
import DestinationChatCard from '@/components/DestinationChatCard';
import {
  getSavedItineraries,
  saveItinerary,
  removeItinerary,
  getNextPhaseForDestination,
  getPlannedPhasesForDestination,
  generatePlannedPhasesSummary,
} from '@/lib/itinerary-storage';
import type { SavedItinerary } from '@/lib/itinerary-storage';
import ItineraryModal from '@/components/ItineraryModal';

const quickReplies = [
  { label: 'Looking for peace and quiet', message: 'Looking for peace and quiet' },
  { label: 'Beach and nature combined', message: 'Beach and nature combined' },
  { label: 'Mountain healing vibes', message: 'Mountain healing vibes' },
  { label: 'Good WiFi for remote work', message: 'Good WiFi for remote work' },
  { label: 'Budget-friendly option', message: 'Budget-friendly option' },
  { label: 'Focus on wellness', message: 'Focus on wellness' },
];

const emotionQuickReplies = [
  { label: 'Stressed & Overwhelmed', description: 'Need to decompress and slow down', message: 'I\'m feeling really stressed and overwhelmed lately', icon: 'wind' },
  { label: 'Burnt Out & Exhausted', description: 'Running on empty, need deep recharge', message: 'I\'m completely burnt out and exhausted', icon: 'battery' },
  { label: 'Lonely & Disconnected', description: 'Craving meaningful connection', message: 'I\'m feeling lonely and disconnected', icon: 'users' },
  { label: 'Anxious & Restless', description: 'Can\'t settle, need calm and grounding', message: 'I\'ve been feeling anxious and restless', icon: 'wind' },
  { label: 'Lost & Seeking Purpose', description: 'Searching for direction and meaning', message: 'I feel lost and I\'m seeking purpose and direction', icon: 'compass' },
  { label: 'Grieving & Heartbroken', description: 'Need space to process and heal', message: 'I\'m going through grief and need healing', icon: 'heart' },
];

interface ChatInterfaceProps {
  initialMessages?: Message[];
  destinationContext?: string;
  destinationName?: string;
  continueSlug?: string;
  continueName?: string;
  isProUser?: boolean;
  onMatchCountChange?: (count: number) => void;
}

export default function ChatInterface({
  initialMessages = [],
  destinationContext,
  destinationName,
  continueSlug,
  continueName,
  isProUser: initialIsProUser = false,
  onMatchCountChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('serenestay_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isProUser, setIsProUser] = useState(() => checkProStatus());
  const [chatDisabled, setChatDisabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasAutoTriggeredRef = useRef(false);
  const isAutoTriggerRef = useRef(false);

  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  useEffect(() => {
    fetch('/api/destinations?fields=card')
      .then((r) => r.json())
      .then((data: { destinations: Destination[] }) => setAllDestinations(data.destinations || []))
      .catch(() => {});
  }, []);

  const [viewingItinerary, setViewingItinerary] = useState<SavedItinerary | null>(null);

  const displayName = destinationName || destinationContext || '';
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: destinationContext
      ? `Let me tell you about ${displayName}`
      : isProUser
        ? `Hello! I'm Serene, your personal wellness travel guide. I'll help you find a healing stay that's truly matched to how you're feeling — not just a popular destination, but one that speaks to YOUR needs.\n\nTo give you the most personalized recommendation, I'd love to understand you better. Tap one of the emotion cards below to get started, or simply tell me what's on your mind.`
        : `Hello! I'm Serene, your wellness travel guide. I'm here to help you find the perfect healing stay that matches your needs and dreams.

What matters most to you in a wellness destination? You can tell me about:
• Your budget and preferred climate
• Activities like yoga, meditation, or nature walks
• Need for good WiFi or remote work conditions
• Any health or medical considerations

Or just share what's on your mind, and we'll explore together.`,
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const toSave = messages.length > 20 ? messages.slice(-20) : messages;
      localStorage.setItem('serenestay_chat_history', JSON.stringify(toSave));
    }
  }, [messages]);

  useEffect(() => {
    const isPro = checkProStatus();
    setIsProUser(isPro);
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isNearBottomRef.current) return;
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (destinationContext && !hasAutoTriggeredRef.current && messages.length <= 1) {
      hasAutoTriggeredRef.current = true;
      isAutoTriggerRef.current = true;
      handleStreamResponse(
        `I'm interested in ${destinationName || destinationContext}. Please give me a detailed overview based on the 9-dimension scoring, highlights, and practical info.`
      );
      return;
    }

    if (continueSlug && !hasAutoTriggeredRef.current && messages.length > 1) {
      hasAutoTriggeredRef.current = true;
      isAutoTriggerRef.current = true;
      handleStreamResponse(
        `I'd like to know more about ${continueName || continueSlug}. Can you tell me more details about what makes it special for wellness travel?`
      );
    }
  }, [destinationContext, destinationName, continueSlug, continueName, messages.length]);

  const detectMissingItineraryMarker = (response: string, userMsg: string, allMessages: Message[]): string | null => {
    if (response.match(/\[ITINERARY:[^\]]+\]/)) return null;

    const dayHeaders = response.match(/\*\*Day\s+\d+/g);
    if (!dayHeaders || dayHeaders.length < 2) return null;

    const regenKeywords = /regenerat|not satisfied|try again|change.*days?|make it|modify|revise|redo|different|shorter|longer|more.*focus|less.*focus|adjust|update.*itin|重新|不满意|再[生创]|改[一变]|换.*天|调整/i;
    const hasRegenKeyword = regenKeywords.test(userMsg);

    const hasExistingItinerary = allMessages.some(m => m._itineraryData);

    if (!hasRegenKeyword && !hasExistingItinerary) return null;

    for (const msg of allMessages) {
      if (msg._itineraryData && typeof msg._itineraryData === 'object') {
        const slug = (msg._itineraryData as SavedItinerary).slug;
        if (slug) return slug;
      }
    }

    const allContent = allMessages.map(m => m.content).join(' ') + ' ' + response;
    const destMatch = allContent.match(/\[DEST:([^\]]+)\]/);
    if (destMatch) return destMatch[1];

    return null;
  };

  const handleStreamResponse = useCallback(async (userMessage: string) => {
    setIsStreaming(true);

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    let fullResponse = '';

    try {
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
            isAutoTriggerRef.current = false;

            let itineraryMatch = fullResponse.match(/\[ITINERARY:([^\]]+)\]/);

            if (!itineraryMatch) {
              const detectedSlug = detectMissingItineraryMarker(fullResponse, userMessage, [...messages, { id: 'current', role: 'user' as const, content: userMessage }]);
              if (detectedSlug) {
                fullResponse += `\n\n[ITINERARY:${detectedSlug}]`;
                itineraryMatch = fullResponse.match(/\[ITINERARY:([^\]]+)\]/);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullResponse }
                      : msg
                  )
                );
              }
            }

            if (itineraryMatch) {
              const slug = itineraryMatch[1];
              const cleanContent = fullResponse.replace(/\[ITINERARY:[^\]]+\]/, '').trim();

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: cleanContent }
                    : msg
                )
              );

              handleGenerateItinerary(slug, cleanContent);
            }
          }
        },
        isProUser,
        proToken
      );
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = errorMsg.includes('timed out');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: isTimeout
                  ? 'I apologize, but the request took too long to process. Please try again — if the issue persists, the service may be temporarily busy.'
                  : 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to reach out to us directly.'
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isProUser, onMatchCountChange]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    await handleStreamResponse(trimmedInput);
  };

  const handleQuickReply = async (reply: { label: string; message: string }, messageId?: string) => {
    if (reply.label === 'View Full Itinerary' && messageId) {
      const sourceMsg = messages.find(m => m.id === messageId);
      const itData = sourceMsg?._itineraryData as SavedItinerary | undefined;
      if (itData) {
        setViewingItinerary(itData);
        return;
      }
    }

    if (messageId) {
      setMessages((prev) => prev.map(m =>
        m.id === messageId ? { ...m, quickReplies: undefined } : m
      ));
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: reply.message,
    };

    setMessages((prev) => [...prev, userMessage]);
    await handleStreamResponse(reply.message);
  };

  const parseItineraryForChat = (content: string, slug: string) => {
    const nameMatch = content.match(/#\s*(?:Your\s+)?\d+-Day\s+(?:Wellness|Healing)\s+(?:Retreat|Stay)\s+in\s+(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : slug;

    const durationMatch = content.match(/(\d+)-Day/i);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 7;

    const focusMatch = content.match(/###\s*(?:Wellness\s+)?Focus(?::\s*)?(.+)/i);
    const focus = focusMatch ? focusMatch[1].trim().replace(/[^a-z\s]/gi, '').trim().toLowerCase() || 'wellness' : 'wellness';

    const overviewMatch = content.match(/###\s*Trip\s+Overview\s*\n([\s\S]*?)(?=###|$)/i);
    const overview = overviewMatch ? overviewMatch[1].trim() : '';

    const phase = getNextPhaseForDestination(slug);

    const plannedPhases = getPlannedPhasesForDestination(slug);
    const startDay = plannedPhases.length > 0
      ? Math.max(...plannedPhases.map(p => {
          const range = (p.dayRange || '1-1').split('-').map(Number);
          return range[1] || 0;
        })) + 1
      : 1;
    const endDay = startDay + duration - 1;
    const dayRange = `${startDay}-${endDay}`;

    const plannedDaysSummary = `Phase ${phase}: Days ${dayRange} - ${focus} focus (${duration} days)`;

    const itinerary = {
      slug,
      name,
      duration,
      focus,
      savedAt: new Date().toISOString(),
      parsed: { itinerary: content },
      overview,
      phase,
      dayRange,
      totalTripDays: duration,
      plannedDaysSummary,
    };

    saveItinerary(itinerary);
    return itinerary;
  };

  const handleGenerateItinerary = async (slug: string, chatContext: string) => {
    if (!isProUser) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsStreaming(true);

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: 'Generating your personalized itinerary...' },
    ]);

    try {
      const proToken = typeof window !== 'undefined'
        ? localStorage.getItem('serenestay_pro_token') || undefined
        : undefined;

      const plannedPhasesSummary = generatePlannedPhasesSummary(slug);

      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          proToken,
          duration: (() => {
            const userMessages = messages.filter(m => m.role === 'user').slice(-4).map(m => m.content).join(' ');
            const daysMatch = userMessages.match(/(\d+)\s*[-\s]?\s*(?:days?|nights?|天)/i);
            return daysMatch ? parseInt(daysMatch[1]) : 7;
          })(),
          focus: (() => {
            const recentMessages = messages.slice(-6).map(m => m.content).join(' ');
            const focusPatterns = [
              /(?:focus|focused)\s+on\s+(wellness|nature|culture|nomad|adventure|spiritual|detox|yoga|meditation)/i,
              /(?:looking\s+for|want|prefer|interested\s+in)\s+(?:a\s+)?(wellness|nature|culture|nomad|adventure|spiritual|detox|yoga|meditation)/i,
              /(wellness|nature|culture|nomad|adventure|spiritual|detox|yoga|meditation)\s+(?:focus|trip|retreat|experience)/i,
            ];
            for (const pattern of focusPatterns) {
              const match = recentMessages.match(pattern);
              if (match) return match[1].toLowerCase();
            }
            return 'wellness';
          })(),
          chatContext,
          plannedPhasesSummary,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errData.error || `Failed to generate itinerary (HTTP ${response.status})`);
      }

      const data = await response.json();
      const itineraryContent = data.itinerary;

      const saved = parseItineraryForChat(itineraryContent, slug);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Your ${saved.duration}-day ${saved.focus} itinerary for ${saved.name} is ready! I've saved it for you — click below to explore the full day-by-day plan with activities, tips, and budget details.`,
                quickReplies: [
                  { label: 'Satisfied', message: "I'm satisfied with this itinerary, thank you!" },
                  { label: 'Not quite', message: "This itinerary doesn't quite match what I was looking for. Can you adjust it?" },
                  { label: 'View Full Itinerary', message: `Show me the full itinerary for ${saved.name}` },
                  { label: 'Adjust it', message: "I'd like to adjust some parts of this itinerary. Can you change the activities or focus?" },
                ],
                _itineraryData: saved,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Itinerary generation error:', error);
      const errDetail = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = errDetail.includes('timeout') || errDetail.includes('504') || errDetail.includes('TIMED_OUT');
      const userMsg = isTimeout
        ? 'I apologize, but the itinerary generation is taking longer than expected. Please try again — the service may be temporarily busy.'
        : `I apologize, but I encountered an issue generating your itinerary (${errDetail}). Please try again.`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: userMsg,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleUpgradePrompt = () => {
    setShowUpgradePrompt(!showUpgradePrompt);
  };

  const renderMessageContent = (content: string, isLastAndStreaming: boolean) => {
    const parts = content.split(/(\[DEST:[\w-]+\]|\[EMATCH:[\w-]+:[^\]]+\])/g);

    type CardInfo = { type: 'ematch' | 'dest'; slug: string; matchText?: string; index: number };
    type RenderItem = { type: 'card'; cards: CardInfo[]; key: string } | { type: 'text'; content: string; key: string };

    const items: RenderItem[] = [];
    let currentCards: CardInfo[] = [];
    let firstEmatchSeen = false;

    const flushCards = () => {
      if (currentCards.length > 0) {
        items.push({ type: 'card', cards: [...currentCards], key: `group-${items.length}` });
        currentCards = [];
      }
    };

    parts.forEach((part, i) => {
      const ematchMatch = part.match(/\[EMATCH:([\w-]+):([^\]]+)\]/);
      if (ematchMatch) {
        currentCards.push({ type: 'ematch', slug: ematchMatch[1], matchText: ematchMatch[2], index: i });
        return;
      }
      const destMatch = part.match(/\[DEST:([\w-]+)\]/);
      if (destMatch) {
        currentCards.push({ type: 'dest', slug: destMatch[1], index: i });
        return;
      }
      flushCards();
      if (part) {
        items.push({ type: 'text', content: part, key: `text-${i}` });
      }
    });
    flushCards();

    return items.map((item) => {
      if (item.type === 'text') {
        return <span key={item.key} className="whitespace-pre-wrap leading-relaxed">{item.content}</span>;
      }

      const cards = item.cards;
      const cardElements = cards.map((card) => {
        const dest = allDestinations.find((d) => d.slug === card.slug);
        if (!dest) {
          if (card.type === 'dest') {
            return (
              <Link key={`link-${card.index}`} href={`/destinations/${card.slug}`} className="underline font-medium" style={{ color: 'var(--color-sky-light)' }}>
                View {card.slug} →
              </Link>
            );
          }
          return null;
        }

        const isTopPick = card.type === 'ematch' && !firstEmatchSeen ? (firstEmatchSeen = true, true) : false;

        if (card.type === 'ematch') {
          return <DestinationChatCard key={`card-${card.index}`} dest={dest} emotionMatch={card.matchText} isTopPick={isTopPick} />;
        }
        return <DestinationChatCard key={`card-${card.index}`} dest={dest} isTopPick={isTopPick} />;
      }).filter(Boolean);

      if (cardElements.length > 1) {
        return (
          <div key={item.key} className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
            {cardElements}
          </div>
        );
      }
      return <div key={item.key}>{cardElements}</div>;
    });
  };

  const glassHeaderStyle = {
    background: 'rgba(14,36,25,0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  };

  const userBubbleStyle = {
    background: 'var(--color-sky)',
    color: 'var(--color-white)',
    borderBottomRightRadius: '6px',
  };

  const assistantBubbleStyle = {
    background: 'rgba(255,255,255,0.08)',
    color: 'var(--color-white)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderBottomLeftRadius: '6px',
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--color-white)',
    borderRadius: '16px',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]" style={{ background: 'var(--color-forest-deep)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={glassHeaderStyle}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-canopy), var(--color-moss))' }}>
            <Leaf className="w-5 h-5" style={{ color: 'var(--color-white)' }} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: 'var(--color-moss)', borderColor: 'var(--color-forest-deep)' }} />
          </div>
          <div>
            <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}>Serene</h2>
            <p className="text-xs flex items-center gap-1" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-moss)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-moss)' }} />
              Wellness Guide
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (messages.length > 1) {
                if (!confirm('Start a new conversation? Your current chat history and any unsaved itinerary drafts will be cleared. Saved itineraries won\'t be affected.')) {
                  return;
                }
              }
              localStorage.removeItem('serenestay_chat_history');
              setMessages([welcomeMessage]);
            }}
            title={messages.length > 1 ? 'This will clear your current conversation' : 'Start new conversation'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--color-white-60)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
              e.currentTarget.style.color = 'var(--color-white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--color-white-60)';
            }}
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Chat</span>
          </button>

          {!isProUser && (
            <button
              onClick={toggleUpgradePrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'var(--color-sand)',
                color: 'var(--color-forest-deep)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-sand-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-sand)'}
              aria-label="Upgrade to Pro"
            >
              <Lock className="w-3 h-3" />
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {showUpgradePrompt && !isProUser && (
        <div className="mx-4 mt-4 p-4 rounded-xl animate-slide-down" style={{ background: 'rgba(212,197,169,0.12)', border: '1px solid rgba(212,197,169,0.25)' }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,197,169,0.2)' }}>
              <Compass className="w-5 h-5" style={{ color: 'var(--color-sand)' }} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white)' }}>Unlock Personalized Itineraries</h4>
              <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
                Upgrade to Pro for custom-matched destinations, detailed insights, and exclusive day-by-day wellness guides.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: 'var(--color-sand)',
                    color: 'var(--color-forest-deep)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-sand-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-sand)'}
                >
                  View Pro Plans
                </Link>
                <button
                  onClick={toggleUpgradePrompt}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-white-60)'}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className={`max-w-[80%] rounded-2xl px-4 py-3`}
                style={message.role === 'user' ? userBubbleStyle : assistantBubbleStyle}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--color-moss)' }}>
                    <Leaf className="w-3 h-3" />
                    <span style={{ fontFamily: 'var(--font-body)' }}>Serene</span>
                  </div>
                )}
                <div className="leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {renderMessageContent(message.content, message.id === messages[messages.length - 1]?.id && isStreaming)}
                  {message.id === messages[messages.length - 1]?.id && isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ background: 'var(--color-white-40)' }} />
                  )}
                </div>

                {message.quickReplies && message.quickReplies.length > 0 && !isStreaming && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {message.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply, message.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                        style={{
                          fontFamily: 'var(--font-body)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--color-white-80)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                          e.currentTarget.style.color = 'var(--color-white)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                          e.currentTarget.style.color = 'var(--color-white-80)';
                        }}
                      >
                        {reply.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto">
            {isProUser && (
              <p className="text-xs mb-3 text-center font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
                How are you feeling? Tap a card to start your personalized healing journey
              </p>
            )}
            {isProUser ? (
              <div className="grid grid-cols-2 gap-2 pb-2">
                {emotionQuickReplies.map((reply) => (
                  <button
                    key={reply.message}
                    onClick={() => handleQuickReply(reply)}
                    className="flex flex-col items-start px-4 py-3 rounded-xl text-left transition-all group"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    disabled={isStreaming || chatDisabled}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(91,143,168,0.4)';
                      e.currentTarget.style.background = 'rgba(91,143,168,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    <span className="text-sm font-medium transition-colors flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-80)' }}>
                      {reply.icon === 'battery' && <BatteryLow className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />}
                      {reply.icon === 'wind' && <Wind className="w-4 h-4" style={{ color: 'var(--color-sky)' }} />}
                      {reply.icon === 'users' && <Users className="w-4 h-4" style={{ color: 'var(--color-moss)' }} />}
                      {reply.icon === 'compass' && <Compass className="w-4 h-4" style={{ color: 'var(--color-sand)' }} />}
                      {reply.icon === 'heart' && <Heart className="w-4 h-4" style={{ color: 'var(--color-terracotta)' }} />}
                      {reply.label}
                    </span>
                    <span className="text-xs mt-0.5 transition-colors" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
                      {reply.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickReplies.map((reply) => (
                  <button
                    key={reply.message}
                    onClick={() => handleQuickReply(reply)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--color-white-60)',
                      fontFamily: 'var(--font-body)',
                    }}
                    disabled={isStreaming || chatDisabled}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-moss)';
                      e.currentTarget.style.color = 'var(--color-moss)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'var(--color-white-60)';
                    }}
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-4" style={{ background: 'rgba(14,36,25,0.9)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {chatDisabled && !isProUser && (
          <div className="max-w-3xl mx-auto pb-3 text-center">
            <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}>
              You&apos;ve used your free matches.{' '}
              <Link href="/pricing" className="font-medium hover:underline" style={{ color: 'var(--color-sky-light)' }}>
                Upgrade to Pro
              </Link>{' '}
              for unlimited personalized recommendations.
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
              className="flex-1 px-4 py-3 resize-none focus:outline-none transition-all"
              style={inputStyle}
              rows={1}
              maxLength={500}
              aria-label="Type your message"
              disabled={isStreaming || chatDisabled}
              onFocus={(e) => e.target.style.borderColor = 'rgba(91,143,168,0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isStreaming || chatDisabled}
              className="flex-shrink-0 w-12 h-12 rounded-xl transition-colors flex items-center justify-center disabled:cursor-not-allowed"
              style={{
                background: inputValue.trim() && !isStreaming && !chatDisabled ? 'var(--color-sky)' : 'rgba(255,255,255,0.1)',
                color: 'var(--color-white)',
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() && !isStreaming && !chatDisabled) {
                  e.currentTarget.style.background = 'var(--color-sky-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (inputValue.trim() && !isStreaming && !chatDisabled) {
                  e.currentTarget.style.background = 'var(--color-sky)';
                }
              }}
              aria-label="Send message"
            >
              <Send className={`w-5 h-5 ${isStreaming ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <p className="mt-2 text-center text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-40)' }}>
            Serene is a wellness guide. Consider important decisions carefully.
          </p>
        </div>
      </div>

      {viewingItinerary && (
        <ItineraryModal
          itinerary={viewingItinerary}
          onClose={() => setViewingItinerary(null)}
          onDelete={() => {
            if (viewingItinerary) {
              removeItinerary(viewingItinerary.slug, viewingItinerary.phase, viewingItinerary.focus);
            }
            setViewingItinerary(null);
          }}
        />
      )}
    </div>
  );
}
