'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Pencil, Loader2 } from 'lucide-react';
import { MOOD_CHIPS } from '@/components/MoodChips';
import { getCategoryEmoji } from '@/lib/itinerary-images';

// Re-export getCategoryEmoji from itinerary-images for convenience
export { getCategoryEmoji } from '@/lib/itinerary-images';

// JSON format types for structured day content
export interface DayActivity {
  name: string;
  imageTags: string[];
  description: string;
  duration: string;
  cost: string;
}

export interface DaySection {
  period: string;
  emoji: string;
  activities: DayActivity[];
}

export interface DayContent {
  title: string;
  summary: string;
  sections: DaySection[];
  tip: string;
  moodCheck: string;
  note: string;
}

// Old format from storage: { content: string, note?: string }
interface DayContentData {
  content: string;
  note?: string;
}

interface ItineraryDayCardProps {
  dayNumber: number;
  title: string;
  content: string | DayContent | DayContentData;
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
  // Handle three content formats:
  // 1. string (markdown)
  // 2. DayContentData (old format: { content: string, note?: string })
  // 3. DayContent (new structured format with sections)
  const isOldFormat = typeof content === 'object' && content !== null && 'content' in content && typeof (content as any).content === 'string';
  const isJsonContent = typeof content === 'object' && content !== null && 'sections' in content;
  const dayData = isJsonContent ? (content as DayContent) : null;

  // For old format, extract the string content
  const actualContent = isOldFormat ? (content as any).content : content;

  // Get mood chip display info
  const getMoodDisplay = (id: string) => {
    const chip = MOOD_CHIPS.find(c => c.id === id);
    return chip ? { emoji: chip.emoji, label: chip.label } : { emoji: '✨', label: id };
  };

  // Parse image tags for markdown fallback rendering
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
          {isJsonContent && dayData ? (
            <div className="space-y-4">
              {/* Summary */}
              {dayData.summary && (
                <p className="text-primary/60 text-sm italic">{dayData.summary}</p>
              )}

              {/* Sections: Morning / Afternoon / Evening */}
              {dayData.sections.map((section, si) => (
                <div key={si}>
                  <h4 className="font-serif text-base text-primary mt-4 mb-2">
                    {section.emoji} {section.period.charAt(0).toUpperCase() + section.period.slice(1)}
                  </h4>
                  {section.activities.map((activity, ai) => (
                    <div key={ai} className="ml-2 mb-3">
                      <p className="font-medium text-primary mb-1">
                        {activity.name}
                        {activity.imageTags && activity.imageTags.map((tag, ti) => {
                          const isWiki = tag.startsWith('wiki:');
                          const value = tag.split(':')[1] || tag;
                          return isWiki ? (
                            <span key={ti} className="inline-flex items-center gap-0.5 mx-1 text-xs text-primary/60">
                              📍 {value.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span key={ti} className="inline-flex items-center gap-0.5 mx-1 text-xs text-primary/60">
                              {getCategoryEmoji(value)} {value}
                            </span>
                          );
                        })}
                      </p>
                      <p className="text-sm text-primary/70 mb-1">{activity.description}</p>
                      {(activity.duration || activity.cost) && (
                        <div className="flex gap-3 text-xs text-primary/50">
                          {activity.duration && <span>⏰ {activity.duration}</span>}
                          {activity.cost && <span>💰 {activity.cost}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Tip */}
              {dayData.tip && (
                <div className="bg-accent/10 rounded-lg p-3">
                  <p className="text-sm text-primary/70"><span className="font-medium">💡 Tip:</span> {dayData.tip}</p>
                </div>
              )}

              {/* Mood Check */}
              {dayData.moodCheck && (
                <p className="text-sm text-primary/50 mt-2">🎯 {dayData.moodCheck}</p>
              )}

              {/* Disclaimer */}
              {dayData.note && (
                <p className="text-xs text-primary/30 mt-3 italic">📝 {dayData.note}</p>
              )}
            </div>
          ) : (
            /* Fallback: markdown rendering (original logic preserved) */
            <div className="prose prose-sm max-w-none text-primary/70">
              {(actualContent as string).split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('### ')) {
                  return (
                    <h4 key={i} className="font-serif text-base text-primary mt-4 mb-2">
                      {renderLineWithImages(trimmed.replace('### ', ''), `h-${i}`)}
                    </h4>
                  );
                }

                if (trimmed.startsWith('**')) {
                  return (
                    <p key={i} className="mb-2 font-medium text-primary">
                      {renderLineWithImages(trimmed, `b-${i}`)}
                    </p>
                  );
                }

                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <li key={i} className="ml-4 mb-1 list-disc">
                      {renderLineWithImages(trimmed.substring(2), `li-${i}`)}
                    </li>
                  );
                }

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
          )}

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
