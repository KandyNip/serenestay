'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Pencil, Loader2 } from 'lucide-react';
import { MOOD_CHIPS } from '@/components/MoodChips';
import { getCategoryEmoji } from '@/lib/itinerary-images';

// Re-export getCategoryEmoji from itinerary-images for convenience
export { getCategoryEmoji } from '@/lib/itinerary-images';

interface ItineraryDayCardProps {
  dayNumber: number;
  title: string;
  content: string;
  moodChips: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onRegenerate: () => void;
  onEdit?: () => void;
  isGenerating?: boolean;
}

export default function ItineraryDayCard({
  dayNumber,
  title,
  content,
  moodChips,
  isExpanded,
  onToggle,
  onRegenerate,
  onEdit,
  isGenerating = false,
}: ItineraryDayCardProps) {
  // Parse image tags and render with emoji indicators
  const renderLineWithImages = (line: string, key: string) => {
    const imageTagRegex = /\[(wiki|cat):([^\]]+)\]/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = imageTagRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const [, type, value] = match;
      if (type === 'cat') {
        const emoji = getCategoryEmoji(value);
        parts.push(
          <span key={`${key}-${match.index}`} className="inline-flex items-center gap-0.5 mx-0.5 text-xs text-primary/60">
            {emoji} {value}
          </span>
        );
      } else if (type === 'wiki') {
        parts.push(
          <span key={`${key}-${match.index}`} className="inline-flex items-center gap-0.5 mx-0.5 text-xs text-primary/60">
            📍 {value.replace(/_/g, ' ')}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : line;
  };

  // Get mood chip display info
  const getMoodDisplay = (id: string) => {
    const chip = MOOD_CHIPS.find(c => c.id === id);
    return chip ? { emoji: chip.emoji, label: chip.label } : { emoji: '✨', label: id };
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 ${
      isGenerating ? 'border-secondary/40 shadow-sm' : 'border-primary/10 hover:border-primary/20'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/[0.02] transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Day number badge */}
          <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-secondary text-white rounded-full text-sm font-semibold">
            {dayNumber}
          </span>

          <div className="min-w-0 text-left">
            <span className="font-medium text-primary block truncate">
              {title || `Day ${dayNumber}`}
            </span>
            {/* Mood chips */}
            {moodChips.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {moodChips.map(id => {
                  const mood = getMoodDisplay(id);
                  return (
                    <span key={id} className="inline-flex items-center gap-0.5 text-xs text-primary/50">
                      {mood.emoji} {mood.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isGenerating && (
            <Loader2 className="w-4 h-4 text-secondary animate-spin" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-primary/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary/40" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-primary/10">
          {/* Content */}
          <div className="prose prose-sm max-w-none text-primary/70">
            {content.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Section headers (### 🌅 Morning, etc.)
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={i} className="font-serif text-base text-primary mt-4 mb-2">
                    {renderLineWithImages(trimmed.replace('### ', ''), `h-${i}`)}
                  </h4>
                );
              }

              // Bold activity names
              if (trimmed.startsWith('**')) {
                return (
                  <p key={i} className="mb-2 font-medium text-primary">
                    {renderLineWithImages(trimmed, `b-${i}`)}
                  </p>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <li key={i} className="ml-4 mb-1 list-disc">
                    {renderLineWithImages(trimmed.substring(2), `li-${i}`)}
                  </li>
                );
              }

              // Numbered lists
              if (trimmed.match(/^\d+\./)) {
                return (
                  <li key={i} className="ml-4 mb-1 list-decimal">
                    {renderLineWithImages(trimmed.replace(/^\d+\./, '').trim(), `ol-${i}`)}
                  </li>
                );
              }

              return <p key={i} className="mb-2">{renderLineWithImages(trimmed, `p-${i}`)}</p>;
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-primary/5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary/60 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary/60 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
