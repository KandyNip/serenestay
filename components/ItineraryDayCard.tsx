'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Pencil, Loader2, Sun, Coffee, Moon, MapPin, Leaf, Sunrise, Lightbulb, HeartPulse, StickyNote, Clock, Wallet } from 'lucide-react';
import { getCategoryIconName } from '@/lib/itinerary-images';
import { ENERGY_SLOTS, USER_INTENTIONS } from '@/lib/healing-types';
import type { HealingDayContent, HealingEnergyBlock } from '@/lib/healing-types';
import LucideIcon from './LucideIcon';

export { getCategoryIconName } from '@/lib/itinerary-images';
export type { HealingDayContent, HealingEnergyBlock } from '@/lib/healing-types';

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

interface DayContentData {
  content: string;
  note?: string;
}

interface ItineraryDayCardProps {
  dayNumber: number;
  title: string;
  content: DayContent | HealingDayContent;
  moodChips: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onRegenerate: () => void;
  onEdit?: () => void;
  isGenerating?: boolean;
}

const glassCard = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  borderRadius: '20px',
} as React.CSSProperties;

function getSlotColor(slotId?: string): { line: string; dot: string; icon: React.ReactNode } {
  if (!slotId) return { line: 'rgba(255,255,255,0.2)', dot: 'var(--color-moss)', icon: <Leaf className="w-4 h-4" /> };
  
  const lower = slotId.toLowerCase();
  if (lower.includes('morning') || lower.includes('sunrise') || lower.includes('dawn')) {
    return { line: 'var(--color-sand)', dot: 'var(--color-sand)', icon: <Sun className="w-4 h-4" /> };
  }
  if (lower.includes('afternoon') || lower.includes('noon') || lower.includes('midday') || lower.includes('coffee') || lower.includes('lunch')) {
    return { line: 'var(--color-moss)', dot: 'var(--color-moss)', icon: <Coffee className="w-4 h-4" /> };
  }
  if (lower.includes('evening') || lower.includes('night') || lower.includes('sunset') || lower.includes('dinner')) {
    return { line: 'var(--color-sky)', dot: 'var(--color-sky)', icon: <Moon className="w-4 h-4" /> };
  }
  return { line: 'var(--color-canopy)', dot: 'var(--color-canopy)', icon: <Leaf className="w-4 h-4" /> };
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
  const isHealingContent = typeof content === 'object' && content !== null && 'energyBlocks' in content;
  const isJsonContent = !isHealingContent && typeof content === 'object' && content !== null && 'sections' in content;
  const isOldFormat = typeof content === 'object' && content !== null && 'content' in content && typeof (content as any).content === 'string';
  const isStringFormat = typeof content === 'string';

  const dayData = isJsonContent ? (content as DayContent) : null;
  const healingData = isHealingContent ? (content as HealingDayContent) : null;

  const actualContent = isOldFormat ? (content as any).content : isStringFormat ? content : '';

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
        const iconName = getCategoryIconName(value);
        parts.push(
          <span key={`${key}-${match.index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            <LucideIcon name={iconName} className="w-3.5 h-3.5" /> {value}
          </span>
        );
      } else if (type === 'wiki') {
        parts.push(
          <span key={`${key}-${match.index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', margin: '0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            <MapPin className="w-3 h-3" /> {value.replace(/_/g, ' ')}
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
    <div style={{
      ...glassCard,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      borderColor: isGenerating ? 'rgba(91,143,168,0.4)' : 'var(--glass-border)'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <span style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: 'var(--color-sky)', color: 'white',
            borderRadius: '50%', fontSize: '14px', fontWeight: 600
          }}>
            {dayNumber}
          </span>

          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <span style={{ fontWeight: 500, color: 'var(--color-white)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title || `Day ${dayNumber}`}
            </span>
            {!isHealingContent && moodChips.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {moodChips.map(id => (
                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {isGenerating && (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-sky)' }} />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {isHealingContent && healingData ? (
            <div style={{ paddingTop: '16px' }}>
              {healingData.phaseTitle && (
                <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-sky)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{healingData.phaseTitle}</p>
              )}

              {healingData.summary && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontStyle: 'italic', marginBottom: '16px' }}>{healingData.summary}</p>
              )}

              {/* Timeline */}
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                <div style={{
                  position: 'absolute', left: '7px', top: '8px', bottom: '8px',
                  width: '2px', background: 'linear-gradient(to bottom, var(--color-sand), var(--color-moss), var(--color-sky))',
                  opacity: 0.4
                }} />

                {healingData.energyBlocks.map((block, bi) => {
                  const slotInfo = ENERGY_SLOTS.find(s => s.id === block.slot);
                  const isIntegration = block.isIntegrationTime;
                  const intention = USER_INTENTIONS.find(i => i.id === block.intention);
                  const colors = getSlotColor(block.slot);

                  if (isIntegration) {
                    return (
                      <div key={bi} style={{ position: 'relative', marginBottom: '16px' }}>
                        <div style={{
                          position: 'absolute', left: '-24px', top: '4px',
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: 'var(--color-sand)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        </div>
                        <div style={{ borderLeft: '3px dashed rgba(91,143,168,0.4)', paddingLeft: '12px', paddingTop: '4px', paddingBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, color: 'var(--color-white)' }}>Protected Space</span>
                          </div>
                          {block.whyNote && (
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: '4px' }}>{block.whyNote}</p>
                          )}
                          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                            {block.title || 'A quiet moment for yourself — no agenda, no expectation.'}
                          </p>
                          {block.venue && (
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin className="w-3 h-3" /> {block.venue}
                            </p>
                          )}
                          {block.integrationNote && (
                            <p style={{ fontSize: '12px', color: 'rgba(107,158,126,0.8)', marginTop: '4px', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                              <Leaf className="w-3 h-3 flex-shrink-0 mt-0.5" /> {block.integrationNote}
                            </p>
                          )}
                          {intention && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(91,143,168,0.15)', color: 'var(--color-sky)', fontSize: '10px', fontWeight: 500, borderRadius: '9999px', marginTop: '4px' }}>
                              <LucideIcon name={intention.emoji} className="w-3 h-3" /> {intention.label}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={bi} style={{ position: 'relative', marginBottom: '16px' }}>
                      <div style={{
                        position: 'absolute', left: '-24px', top: '4px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: colors.dot, border: '2px solid var(--color-forest-deep)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 0 3px ${colors.dot}20`
                      }}>
                        <span style={{ color: 'white' }}>{colors.icon}</span>
                      </div>
                      <div style={{ paddingLeft: '4px', paddingTop: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, color: 'var(--color-white)' }}>
                            {slotInfo?.label || block.slot}
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{block.energyLevel}</span>
                        </div>

                        {block.whyNote && (
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: '8px' }}>{block.whyNote}</p>
                        )}

                        <div style={{ marginBottom: '4px' }}>
                          <p style={{ fontWeight: 500, color: 'var(--color-white)', fontSize: '14px', marginBottom: '4px' }}>{block.title}</p>
                          {block.venue && (
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin className="w-3 h-3" /> {block.venue}
                            </p>
                          )}
                        </div>

                        {intention && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: 'rgba(91,143,168,0.15)', color: 'var(--color-sky)', fontSize: '10px', fontWeight: 500, borderRadius: '9999px' }}>
                            <LucideIcon name={intention.emoji} className="w-3 h-3" /> {intention.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {healingData.reflection && (
                <div style={{ background: 'rgba(91,143,168,0.08)', borderRadius: '12px', padding: '12px', marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Leaf className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-sky)' }} />
                    <span><span style={{ fontWeight: 500 }}>Reflection:</span> {healingData.reflection}</span>
                  </p>
                </div>
              )}

              {healingData.returnTransition && healingData.returnTransition.length > 0 && (
                <div style={{ background: 'rgba(212,197,169,0.08)', borderRadius: '12px', padding: '12px', marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-sand)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sunrise className="w-3.5 h-3.5" /> Carrying It Forward
                  </p>
                  {healingData.returnTransition.map((tip, i) => (
                    <p key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>• {tip}</p>
                  ))}
                </div>
              )}

              {healingData.note && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px', fontStyle: 'italic' }}>📝 {healingData.note}</p>
              )}
            </div>
          ) : isJsonContent && dayData ? (
            <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dayData.summary && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontStyle: 'italic' }}>{dayData.summary}</p>
              )}

              {dayData.sections.map((section, si) => (
                <div key={si}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-white)', marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LucideIcon name={section.emoji} className="w-5 h-5" /> {section.period.charAt(0).toUpperCase() + section.period.slice(1)}
                  </h4>
                  {section.activities.map((activity, ai) => (
                    <div key={ai} style={{ marginLeft: '8px', marginBottom: '12px' }}>
                      <p style={{ fontWeight: 500, color: 'var(--color-white)', marginBottom: '4px', fontSize: '14px' }}>
                        {activity.name}
                        {activity.imageTags && activity.imageTags.map((tag, ti) => {
                          const isWiki = tag.startsWith('wiki:');
                          const value = tag.split(':')[1] || tag;
                          return isWiki ? (
                            <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', margin: '0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                              <MapPin className="w-3 h-3" /> {value.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                              <LucideIcon name={getCategoryIconName(value)} className="w-3.5 h-3.5" /> {value}
                            </span>
                          );
                        })}
                      </p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>{activity.description}</p>
                      {(activity.duration || activity.cost) && (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', alignItems: 'center' }}>
                          {activity.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock className="w-3 h-3" /> {activity.duration}</span>}
                          {activity.cost && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Wallet className="w-3 h-3" /> {activity.cost}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {dayData.tip && (
                <div style={{ background: 'rgba(91,143,168,0.1)', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-sky)' }} />
                    <span><span style={{ fontWeight: 500 }}>Tip:</span> {dayData.tip}</span>
                  </p>
                </div>
              )}

              {dayData.moodCheck && (
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartPulse className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-moss)' }} />
                  {dayData.moodCheck}
                </p>
              )}

              {dayData.note && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <StickyNote className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {dayData.note}
                </p>
              )}
            </div>
          ) : (
            <div style={{ paddingTop: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.7 }}>
              {(actualContent as string).split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('### ')) {
                  return (
                    <h4 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-white)', marginTop: '16px', marginBottom: '8px' }}>
                      {renderLineWithImages(trimmed.replace('### ', ''), `h-${i}`)}
                    </h4>
                  );
                }

                if (trimmed.startsWith('**')) {
                  return (
                    <p key={i} style={{ marginBottom: '8px', fontWeight: 500, color: 'var(--color-white)' }}>
                      {renderLineWithImages(trimmed, `b-${i}`)}
                    </p>
                  );
                }

                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'disc' }}>
                      {renderLineWithImages(trimmed.substring(2), `li-${i}`)}
                    </li>
                  );
                }

                if (trimmed.match(/^\d+\./)) {
                  return (
                    <li key={i} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'decimal' }}>
                      {renderLineWithImages(trimmed.replace(/^\d+\./, '').trim(), `ol-${i}`)}
                    </li>
                  );
                }

                return <p key={i} style={{ marginBottom: '8px' }}>{renderLineWithImages(trimmed, `p-${i}`)}</p>;
              })}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
              disabled={isGenerating}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                color: 'rgba(255,255,255,0.6)', background: 'transparent',
                border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-sky)'; e.currentTarget.style.background = 'rgba(91,143,168,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                disabled={isGenerating}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)', background: 'transparent',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-sky)'; e.currentTarget.style.background = 'rgba(91,143,168,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
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
