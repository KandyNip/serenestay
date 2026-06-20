'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ItineraryChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function ItineraryChatInput({
  onSend,
  placeholder = 'Any special requests for this day? (optional)',
  disabled = false,
  isLoading = false,
}: ItineraryChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (isLoading || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="relative flex items-end gap-2 p-3 bg-white border border-primary/15 rounded-xl focus-within:border-secondary/40 focus-within:ring-2 focus-within:ring-secondary/10 transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        rows={1}
        className="flex-1 resize-none bg-transparent text-primary placeholder:text-primary/40 text-sm leading-relaxed focus:outline-none disabled:opacity-50 min-h-[36px] max-h-[120px]"
      />
      <button
        onClick={handleSend}
        disabled={isLoading || disabled}
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-white hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
