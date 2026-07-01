'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { checkProStatus } from '@/lib/api';
import { Sun, Moon, Coffee, Utensils, Lock, Compass, ArrowRight } from 'lucide-react';

interface DayActivity {
  time: string;
  title: string;
  description: string;
  icon: 'morning' | 'afternoon' | 'evening' | 'meal';
}

interface SampleDay {
  day: number;
  title: string;
  theme: string;
  activities: DayActivity[];
  unlocked: boolean;
}

interface JourneyPreviewProps {
  destinationName: string;
  destinationSlug: string;
  healingTags?: string[];
}

const iconMap = {
  morning: Sun,
  afternoon: Coffee,
  evening: Moon,
  meal: Utensils,
};

function generateSampleDays(destinationName: string, tags: string[] = []): SampleDay[] {
  const hasHotSprings = tags.some(t => t.includes('hot-spring') || t.includes('onsen'));
  const hasForest = tags.some(t => t.includes('forest') || t.includes('nature'));
  const hasYoga = tags.some(t => t.includes('yoga') || t.includes('meditation'));
  const hasTemple = tags.some(t => t.includes('temple') || t.includes('zen'));
  const hasOcean = tags.some(t => t.includes('ocean') || t.includes('beach') || t.includes('surf'));

  const day1Morning = hasForest
    ? { time: '7:00 AM', title: 'Dawn Forest Walk', description: 'Begin with a quiet guided walk through ancient trees. Breathe in the forest air as light filters through the canopy.', icon: 'morning' as const }
    : hasOcean
    ? { time: '6:30 AM', title: 'Sunrise by the Water', description: 'Witness the day break over the horizon. A silent moment to arrive fully in this place.', icon: 'morning' as const }
    : hasTemple
    ? { time: '6:00 AM', title: 'Morning Ceremony', description: 'Join the local community for a quiet morning ritual or meditation. No experience needed — just presence.', icon: 'morning' as const }
    : { time: '7:30 AM', title: 'Gentle Awakening', description: 'Start slowly with breathwork or gentle stretching on your terrace, watching the landscape come alive.', icon: 'morning' as const };

  const day1Afternoon = hasYoga
    ? { time: '10:00 AM', title: 'Healing Practice', description: 'A restorative yoga or meditation session tailored to your energy level — restful, not demanding.', icon: 'afternoon' as const }
    : hasHotSprings
    ? { time: '11:00 AM', title: 'Thermal Waters', description: 'Sink into natural hot springs. Let the mineral-rich waters soothe what your body has been carrying.', icon: 'afternoon' as const }
    : { time: '11:00 AM', title: 'Exploration & Rest', description: 'Wander local paths, visit a nearby village, or simply sit and observe. No schedule, no agenda.', icon: 'afternoon' as const };

  const day1Meal = {
    time: '1:00 PM',
    title: 'Nourishing Meal',
    description: 'Slow, seasonal food grown or prepared nearby. Meals here are part of the healing, not just fuel.',
    icon: 'meal' as const,
  };

  const day1Evening = hasTemple
    ? { time: '6:00 PM', title: 'Evening Stillness', description: 'As the day softens, join a quiet chanting or candle-lit meditation at a nearby sanctuary.', icon: 'evening' as const }
    : hasOcean
    ? { time: '6:30 PM', title: 'Sunset Reflection', description: 'Walk the shoreline as the sky turns gold and amber. A journaling prompt invites you to reflect.', icon: 'evening' as const }
    : { time: '7:00 PM', title: 'Quiet Evening', description: 'No screens, no plans. Stargaze, read, or simply rest in the silence of your surroundings.', icon: 'evening' as const };

  return [
    {
      day: 1,
      title: 'Arrival & Grounding',
      theme: `Your first day in ${destinationName} — settling in, letting go of the world you left behind.`,
      activities: [day1Morning, day1Afternoon, day1Meal, day1Evening],
      unlocked: true,
    },
    {
      day: 2,
      title: 'Nature Immersion',
      theme: 'Deepening connection with the land and its rhythms.',
      activities: [],
      unlocked: false,
    },
    {
      day: 3,
      title: 'Body & Breath',
      theme: 'Working gently with your body to release stored tension.',
      activities: [],
      unlocked: false,
    },
    {
      day: 4,
      title: 'Creative Healing',
      theme: 'Expressing what words cannot — through art, movement, or silence.',
      activities: [],
      unlocked: false,
    },
    {
      day: 5,
      title: 'Integration & Return',
      theme: 'Carrying this peace back into your everyday life.',
      activities: [],
      unlocked: false,
    },
  ];
}

export default function JourneyPreview({ destinationName, destinationSlug, healingTags = [] }: JourneyPreviewProps) {
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    setIsPro(checkProStatus());
  }, []);
  
  const days = generateSampleDays(destinationName, healingTags).map(day => ({
    ...day,
    unlocked: isPro ? true : day.day === 1,
  }));

  return (
    <section className="my-12">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h2
            className="text-2xl md:text-3xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
          >
            Sample Healing Journey
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
          >
            A glimpse of what your personalized itinerary looks like.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div
            key={day.day}
            className={`rounded-2xl p-6 md:p-8 transition-all duration-500 ${
              day.unlocked ? '' : 'opacity-60'
            }`}
            style={{
              background: day.unlocked
                ? 'var(--glass-bg-strong)'
                : 'rgba(255,255,255,0.04)',
              backdropFilter: day.unlocked ? 'var(--glass-blur-heavy)' : 'blur(4px)',
              WebkitBackdropFilter: day.unlocked ? 'var(--glass-blur-heavy)' : 'blur(4px)',
              border: day.unlocked
                ? '1px solid var(--glass-border)'
                : '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-sm font-mono font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: day.unlocked ? 'var(--color-sky)' : 'rgba(255,255,255,0.08)',
                      color: day.unlocked ? 'var(--color-white)' : 'var(--color-white-40)',
                    }}
                  >
                    Day {day.day}
                  </span>
                  <h3
                    className="text-lg md:text-xl"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: day.unlocked ? 'var(--color-white)' : 'var(--color-white-40)',
                    }}
                  >
                    {day.title}
                  </h3>
                </div>
                <p
                  className="text-sm max-w-2xl"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: day.unlocked ? 'var(--color-white-60)' : 'var(--color-white-30)',
                  }}
                >
                  {day.theme}
                </p>
              </div>
              {!day.unlocked && (
                <Lock className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--color-white-30)' }} />
              )}
            </div>

            {day.unlocked && day.activities.length > 0 && (
              <div className="mt-6 space-y-4 pl-4" style={{ borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                {day.activities.map((activity, i) => {
                  const IconComponent = iconMap[activity.icon];
                  return (
                    <div key={i} className="relative pl-6">
                      <div
                        className="absolute -left-[21px] w-3 h-3 rounded-full"
                        style={{ background: 'var(--color-sky-light)', top: '4px' }}
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(126,181,204,0.15)' }}
                        >
                          <IconComponent className="w-4 h-4" style={{ color: 'var(--color-sky-light)' }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-mono"
                              style={{ color: 'var(--color-white-40)' }}
                            >
                              {activity.time}
                            </span>
                            <span
                              className="text-sm font-semibold"
                              style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white)' }}
                            >
                              {activity.title}
                            </span>
                          </div>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
                          >
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!day.unlocked && (
              <div className="mt-2">
                <p
                  className="text-sm italic"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-30)' }}
                >
                  Unlock your full day-by-day healing journey...
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-10 text-center p-8 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(58,125,92,0.2), rgba(91,143,168,0.2))',
          border: '1px solid rgba(126,181,204,0.2)',
        }}
      >
        <Compass className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--color-sky-light)' }} />
        <h3
          className="text-xl md:text-2xl mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-white)' }}
        >
          Unlock Your Full Healing Journey
        </h3>
        <p
          className="text-sm max-w-md mx-auto mb-6"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-white-60)' }}
        >
          Get 5 personalized days of morning, afternoon, and evening practices — tailored to how you feel.
        </p>
        {isPro ? (
          <Link
            href={`/itinerary/${destinationSlug}`}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--color-canopy)',
              color: 'var(--color-white)',
            }}
          >
            Start Your Healing Journey
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--color-sky)',
              color: 'var(--color-white)',
            }}
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
