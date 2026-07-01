'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

const glassInput = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  transition: 'all 0.2s'
} as React.CSSProperties;

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
    <div style={{
      ...glassInput,
      display: 'flex', alignItems: 'flex-end', gap: '8px',
      padding: '12px'
    }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        rows={1}
        style={{
          flex: 1, resize: 'none', background: 'transparent',
          color: 'white', fontSize: '14px', lineHeight: 1.6,
          outline: 'none', border: 'none',
          minHeight: '36px', maxHeight: '120px',
          opacity: disabled || isLoading ? 0.5 : 1
        }}
        className="placeholder-white/40"
      />
      <button
        onClick={handleSend}
        disabled={isLoading || disabled}
        style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'var(--color-sky)', color: 'white',
          border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
          opacity: (isLoading || disabled) ? 0.5 : 1
        }}
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
