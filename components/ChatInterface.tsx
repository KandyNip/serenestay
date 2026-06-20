'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Send, MessageCircle, Sparkles, ChevronDown, Lock, Zap, RotateCcw, Map, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Message, Destination } from '@/lib/types';
import { streamChat, getRemainingMatches, incrementMatchCount, checkProStatus } from '@/lib/api';
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

// Quick reply suggestions
const quickReplies = [
  { label: '🌿 Looking for peace and quiet', message: 'Looking for peace and quiet' },
  { label: '🏖️ Beach and nature combined', message: 'Beach and nature combined' },
  { label: '🏔️ Mountain healing vibes', message: 'Mountain healing vibes' },
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
  // State management — initialize from localStorage for chat persistence
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
  const [matchCount, setMatchCount] = useState(0); // will be set from localStorage in useEffect
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isProUser, setIsProUser] = useState(() => checkProStatus());
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

  // State for viewing itinerary in modal
  const [viewingItinerary, setViewingItinerary] = useState<SavedItinerary | null>(null);

  // Welcome message
  const displayName = destinationName || destinationContext || '';
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: destinationContext
      ? `Let me tell you about ${displayName} ✨`
      : isProUser
        ? `Hello! I'm Serene, your personal wellness travel guide ✨ I'll help you find a healing stay that's truly matched to how you're feeling — not just a popular destination, but one that speaks to YOUR needs.\n\nTo give you the most personalized recommendation, I'd love to understand you better. Tap one of the emotion cards below to get started, or simply tell me what's on your mind 💫`
        : `Hello! I'm Serene, your AI wellness travel guide. 🌿 I'm here to help you find the perfect healing stay that matches your needs and dreams.

What matters most to you in a wellness destination? You can tell me about:
• Your budget and preferred climate
• Activities like yoga, meditation, or nature walks
• Need for good WiFi or remote work conditions
• Any health or medical considerations

Or just share what's on your mind, and we'll explore together.`,
  };

  // Initialize with welcome message (only if no localStorage history)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, []);

  // Persist messages to localStorage (keep last 20 to prevent overflow)
  useEffect(() => {
    if (messages.length > 0) {
      const toSave = messages.length > 20 ? messages.slice(-20) : messages;
      localStorage.setItem('serenestay_chat_history', JSON.stringify(toSave));
    }
  }, [messages]);

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

  // Auto-trigger: new conversation vs continue conversation
  useEffect(() => {
    // Mode A: New destination conversation (from homepage)
    if (destinationContext && !hasAutoTriggeredRef.current && messages.length <= 1) {
      hasAutoTriggeredRef.current = true;
      isAutoTriggerRef.current = true;
      handleStreamResponse(
        `I'm interested in ${destinationName || destinationContext}. Please give me a detailed overview based on the 9-dimension scoring, highlights, and practical info.`
      );
      return;
    }

    // Mode B: Continue conversation about a destination (from detail page)
    if (continueSlug && !hasAutoTriggeredRef.current && messages.length > 1) {
      hasAutoTriggeredRef.current = true;
      isAutoTriggerRef.current = true;
      handleStreamResponse(
        `I'd like to know more about ${continueName || continueSlug}. Can you tell me more details about what makes it special for wellness travel?`
      );
    }
  }, [destinationContext, destinationName, continueSlug, continueName, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect if the AI response contains itinerary content but is missing the [ITINERARY:slug] marker
  // This handles regeneration cases where the AI forgets to include the marker
  const detectMissingItineraryMarker = (response: string, userMsg: string, allMessages: Message[]): string | null => {
    // Already has marker — no action needed
    if (response.match(/\[ITINERARY:[^\]]+\]/)) return null;

    // Check if response contains day-by-day itinerary structure (e.g., **Day 1**, **Day 2**)
    const dayHeaders = response.match(/\*\*Day\s+\d+/g);
    if (!dayHeaders || dayHeaders.length < 2) return null;

    // Check if user's message indicates regeneration/modification intent
    const regenKeywords = /regenerat|not satisfied|try again|change.*days?|make it|modify|revise|redo|different|shorter|longer|more.*focus|less.*focus|adjust|update.*itin|重新|不满意|再[生创]|改[一变]|换.*天|调整/i;
    const hasRegenKeyword = regenKeywords.test(userMsg);

    // Also check if there's already an itinerary in the conversation (meaning this is a regeneration)
    const hasExistingItinerary = allMessages.some(m => m._itineraryData);

    if (!hasRegenKeyword && !hasExistingItinerary) return null;

    // Try to extract slug from existing itinerary data in messages
    for (const msg of allMessages) {
      if (msg._itineraryData && typeof msg._itineraryData === 'object') {
        const slug = (msg._itineraryData as SavedItinerary).slug;
        if (slug) return slug;
      }
    }

    // Try to extract slug from [DEST:slug] markers in conversation
    const allContent = allMessages.map(m => m.content).join(' ') + ' ' + response;
    const destMatch = allContent.match(/\[DEST:([^\]]+)\]/);
    if (destMatch) return destMatch[1];

    return null;
  };

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

            // Check for [ITINERARY:slug] marker in the full response
            let itineraryMatch = fullResponse.match(/\[ITINERARY:([^\]]+)\]/);

            // Safety net: detect itinerary content without marker (regeneration case)
            if (!itineraryMatch) {
              const detectedSlug = detectMissingItineraryMarker(fullResponse, userMessage, [...messages, { id: 'current', role: 'user' as const, content: userMessage }]);
              if (detectedSlug) {
                // Inject the marker so the normal flow handles it
                fullResponse += `\n\n[ITINERARY:${detectedSlug}]`;
                itineraryMatch = fullResponse.match(/\[ITINERARY:([^\]]+)\]/);
                // Update the displayed message to include the cleaned version
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
              // Remove marker from display content
              const cleanContent = fullResponse.replace(/\[ITINERARY:[^\]]+\]/, '').trim();

              // Update message with clean content
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: cleanContent }
                    : msg
                )
              );

              // Trigger itinerary generation
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
                  ? 'I apologize, but the request took too long to process. Please try again — if the issue persists, the AI service may be temporarily busy.'
                  : 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to reach out to us directly.'
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
  const handleQuickReply = async (reply: { label: string; message: string }, messageId?: string) => {
    // Special handling: View Full Itinerary button opens modal
    if (reply.label === '📋 View Full Itinerary' && messageId) {
      const sourceMsg = messages.find(m => m.id === messageId);
      const itData = sourceMsg?._itineraryData as SavedItinerary | undefined;
      if (itData) {
        setViewingItinerary(itData);
        // Keep quickReplies visible so user can still provide satisfaction feedback
        return;
      }
    }

    // Clear quickReplies from the source message so buttons disappear after click
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

  // Parse itinerary content and save to localStorage
  const parseItineraryForChat = (content: string, slug: string) => {
    // Extract destination name from content
    const nameMatch = content.match(/#\s*(?:🌿\s*)?(?:Your\s+)?\d+-Day\s+Wellness\s+(?:Retreat|Stay)\s+in\s+(.+)/i);
    const name = nameMatch ? nameMatch[1].trim() : slug;

    // Extract duration
    const durationMatch = content.match(/(\d+)-Day/i);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 7;

    // Extract focus from content or default
    const focusMatch = content.match(/###\s*🧘\s*(?:Wellness\s+)?Focus:\s*(.+)/i);
    const focus = focusMatch ? focusMatch[1].trim().replace(/[^a-z\s]/gi, '').trim().toLowerCase() || 'wellness' : 'wellness';

    // Extract overview
    const overviewMatch = content.match(/###\s*✨\s*Trip\s+Overview\s*\n([\s\S]*?)(?=###|$)/i);
    const overview = overviewMatch ? overviewMatch[1].trim() : '';

    // Get next phase number
    const phase = getNextPhaseForDestination(slug);

    // Calculate day range based on previous phases
    const plannedPhases = getPlannedPhasesForDestination(slug);
    const startDay = plannedPhases.length > 0
      ? Math.max(...plannedPhases.map(p => {
          const range = (p.dayRange || '1-1').split('-').map(Number);
          return range[1] || 0;
        })) + 1
      : 1;
    const endDay = startDay + duration - 1;
    const dayRange = `${startDay}-${endDay}`;

    // Generate summary of planned days
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

  // Handle itinerary generation
  const handleGenerateItinerary = async (slug: string, chatContext: string) => {
    if (!isProUser) {
      // Show upgrade prompt
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

      // Get planned phases summary to avoid repetition
      const plannedPhasesSummary = generatePlannedPhasesSummary(slug);

      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          proToken,
          duration: (() => {
            // Extract duration from recent USER messages only (avoid matching AI examples)
            const userMessages = messages.filter(m => m.role === 'user').slice(-4).map(m => m.content).join(' ');
            // Match: "3 days", "3-day", "3天", "3 day", "3-night" etc.
            const daysMatch = userMessages.match(/(\d+)\s*[-\s]?\s*(?:days?|nights?|天)/i);
            return daysMatch ? parseInt(daysMatch[1]) : 7;
          })(),
          focus: (() => {
            // Extract focus from recent chat context
            const recentMessages = messages.slice(-6).map(m => m.content).join(' ');
            // Match user's explicit focus keywords
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

      // Parse and save itinerary
      const saved = parseItineraryForChat(itineraryContent, slug);

      // Update message with itinerary content and satisfaction buttons
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `✨ Your ${saved.duration}-day ${saved.focus} itinerary for ${saved.name} is ready! I've saved it for you — click below to explore the full day-by-day plan with activities, tips, and budget details.`,
                quickReplies: [
                  { label: '👍 Satisfied', message: "I'm satisfied with this itinerary, thank you!" },
                  { label: '👎 Not quite', message: "This itinerary doesn't quite match what I was looking for. Can you adjust it?" },
                  { label: '📋 View Full Itinerary', message: `Show me the full itinerary for ${saved.name}` },
                  { label: '🔧 Adjust it', message: "I'd like to adjust some parts of this itinerary. Can you change the activities or focus?" },
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
        ? 'I apologize, but the itinerary generation is taking longer than expected. Please try again — the AI service may be temporarily busy.'
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

    // Collect consecutive cards into groups for grid layout
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
      // Non-card part — flush any accumulated cards first
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

      // Card group
      const cards = item.cards;
      const cardElements = cards.map((card) => {
        const dest = allDestinations.find((d) => d.slug === card.slug);
        if (!dest) {
          if (card.type === 'dest') {
            return (
              <Link key={`link-${card.index}`} href={`/destinations/${card.slug}`} className="text-secondary underline font-medium">
                View {card.slug} →
              </Link>
            );
          }
          return null;
        }

        // First EMATCH card overall gets isTopPick
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

        {/* Match Count & Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-primary/50">Your matches</p>
            <p className="font-mono text-sm font-semibold text-primary">
              {matchCount} {isProUser ? '∞' : `/ 2`}
            </p>
          </div>

          {/* New Chat button */}
          <button
            onClick={() => {
              // Only show confirmation if there are messages beyond the welcome message
              if (messages.length > 1) {
                if (!confirm('Start a new conversation? Your current chat history and any unsaved itinerary drafts will be cleared. Saved itineraries won\'t be affected.')) {
                  return;
                }
              }
              localStorage.removeItem('serenestay_chat_history');
              setMessages([welcomeMessage]);
            }}
            title={messages.length > 1 ? '⚠️ This will clear your current conversation' : 'Start new conversation'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Chat</span>
          </button>

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
              <h4 className="font-medium text-primary">Unlock 5 AI Matches</h4>
              <p className="mt-1 text-sm text-primary/70">
                You&apos;ve used your free match. Upgrade to Pro for 5 AI-matched destinations,
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

                {/* Quick Replies / Satisfaction Buttons */}
                {message.quickReplies && message.quickReplies.length > 0 && !isStreaming && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-primary/10">
                    {message.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply, message.id)}
                        className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-medium rounded-full transition-colors"
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
              for 5 AI-matched destinations.
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

      {/* Itinerary Modal for viewing generated itinerary */}
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
