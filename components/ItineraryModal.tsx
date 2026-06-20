'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Map, Calendar, Target, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { SavedItinerary } from '@/lib/itinerary-storage';
import { getCategoryImage, getCategoryEmoji } from '@/lib/itinerary-images';

interface ItineraryModalProps {
  itinerary: SavedItinerary;
  onClose: () => void;
  onDelete: () => void;
}

export default function ItineraryModal({ itinerary, onClose, onDelete }: ItineraryModalProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; alt: string } | null>(null);

  const toggleDay = (dayNum: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      return next;
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this saved itinerary?')) {
      onDelete();
    }
  };

  // Parse itinerary content
  const parseItinerary = () => {
    const content = itinerary.parsed?.itinerary || '';
    const lines = content.split('\n');

    const days: { day: number; title: string; content: string[] }[] = [];
    let currentDay: { day: number; title: string; content: string[] } | null = null;
    let overview = '';
    let budget = '';
    let disclaimer = '';

    let section: 'overview' | 'days' | 'budget' | 'disclaimer' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect day headers
      const dayMatch = trimmed.match(/^\*\*Day\s+(\d+)[^*]*\*\*(.*)$/);
      if (dayMatch) {
        if (currentDay) days.push(currentDay);
        currentDay = {
          day: parseInt(dayMatch[1]),
          title: dayMatch[2].trim(),
          content: [],
        };
        section = 'days';
        continue;
      }

      // Detect sections
      if (trimmed.match(/^(?:# )?overview/i) || trimmed.match(/^行程概述/i)) {
        section = 'overview';
        continue;
      }
      if (trimmed.match(/^(?:# )?budget/i) || trimmed.match(/^预算/i)) {
        section = 'budget';
        continue;
      }
      if (trimmed.match(/^(?:# )?disclaimer/i) || trimmed.match(/^免责/i)) {
        section = 'disclaimer';
        continue;
      }

      // Add content to appropriate section
      if (section === 'overview') {
        overview += trimmed + '\n';
      } else if (section === 'budget') {
        budget += trimmed + '\n';
      } else if (section === 'disclaimer') {
        disclaimer += trimmed + '\n';
      } else if (section === 'days' && currentDay) {
        currentDay.content.push(trimmed);
      }
    }

    if (currentDay) days.push(currentDay);

    return {
      overview: overview.trim(),
      days,
      budget: budget.trim(),
      disclaimer: disclaimer.trim(),
    };
  };

  const parsed = parseItinerary();

  // Parse image tags like [wiki:Page_Title] or [cat:category] and render as images
  const renderLineWithImages = (line: string, key: string) => {
    // Match [wiki:Page_Title] or [cat:category] tags
    const imageTagRegex = /\[(wiki|cat):([^\]]+)\]/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = imageTagRegex.exec(line)) !== null) {
      // Add text before the tag
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const [, type, value] = match;
      if (type === 'cat') {
        // Category image
        const imageUrl = getCategoryImage(value);
        const emoji = getCategoryEmoji(value);
        parts.push(
          <span key={`${key}-${match.index}`} className="inline-flex items-center gap-1 mx-1">
            <img
              src={imageUrl}
              alt={value}
              className="w-12 h-12 rounded object-cover inline-block cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setEnlargedImage({ url: imageUrl, alt: value })}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-xs">{emoji} {value}</span>
          </span>
        );
      } else if (type === 'wiki') {
        // Wikipedia image - use a placeholder or fetch from API
        parts.push(
          <span key={`${key}-${match.index}`} className="inline-flex items-center gap-1 mx-1 text-xs text-primary/60">
            📷 {value.replace(/_/g, ' ')}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : line;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#6b8f71]/5 to-[#e8b960]/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl text-primary mb-2">
                {itinerary.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-primary/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {itinerary.duration} Days
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span className="capitalize">{itinerary.focus}</span> Focus
                </span>
                <span className="text-xs text-primary/40">
                  Saved {new Date(itinerary.savedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-primary/5 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-primary/60" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Overview */}
          {parsed.overview && (
            <div className="mb-6">
              <h3 className="font-serif text-lg text-primary mb-3">Overview</h3>
              <div className="prose prose-sm max-w-none text-primary/70">
                {parsed.overview.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Days */}
          {parsed.days.length > 0 && (
            <div className="mb-6">
              <h3 className="font-serif text-lg text-primary mb-4">Day-by-Day Itinerary</h3>
              <div className="space-y-3">
                {parsed.days.map((day) => (
                  <div
                    key={day.day}
                    className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                  >
                    <button
                      onClick={() => toggleDay(day.day)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-[#6b8f71] text-white rounded-full text-sm font-semibold">
                          {day.day}
                        </span>
                        <span className="font-medium text-primary text-left">
                          {day.title || `Day ${day.day}`}
                        </span>
                      </div>
                      {expandedDays.has(day.day) ? (
                        <ChevronUp className="w-5 h-5 text-primary/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-primary/40" />
                      )}
                    </button>
                    {expandedDays.has(day.day) && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                        <div className="prose prose-sm max-w-none text-primary/70">
                          {day.content.map((line, i) => {
                            if (!line) return null;
                            if (line.startsWith('- ') || line.startsWith('* ')) {
                              return (
                                <li key={i} className="ml-4 mb-1">
                                  {renderLineWithImages(line.substring(2), `li-${i}`)}
                                </li>
                              );
                            }
                            if (line.match(/^\d+\./)) {
                              return (
                                <li key={i} className="ml-4 mb-1 list-decimal">
                                  {renderLineWithImages(line.replace(/^\d+\./, '').trim(), `ol-${i}`)}
                                </li>
                              );
                            }
                            return <p key={i} className="mb-2">{renderLineWithImages(line, `p-${i}`)}</p>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          {parsed.budget && (
            <div className="mb-6">
              <h3 className="font-serif text-lg text-primary mb-3">Budget Estimate</h3>
              <div className="bg-[#e8b960]/5 border border-[#e8b960]/20 rounded-xl p-4">
                <div className="prose prose-sm max-w-none text-primary/70">
                  {parsed.budget.split('\n').map((line, i) => {
                    if (line.startsWith('|')) {
                      // Simple table row rendering
                      const cells = line.split('|').filter(c => c.trim());
                      if (cells.length > 0) {
                        return (
                          <div key={i} className="flex gap-4 py-1 border-b border-[#e8b960]/10 last:border-0">
                            {cells.map((cell, j) => (
                              <span key={j} className="flex-1 text-sm">
                                {cell.trim()}
                              </span>
                            ))}
                          </div>
                        );
                      }
                    }
                    if (line.trim()) {
                      return <p key={i} className="mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {parsed.disclaimer && (
            <div className="mb-6">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-xs text-primary/60 italic">
                  {parsed.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <Link
            href={`/destinations/${itinerary.slug}`}
            onClick={onClose}
            className="btn-secondary px-5 py-2 inline-flex items-center gap-2 text-sm"
          >
            <Map className="w-4 h-4" />
            View Destination
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setEnlargedImage(null)}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={enlargedImage.url}
            alt={enlargedImage.alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
