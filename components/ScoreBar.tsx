'use client';

interface ScoreBarProps {
  label: string;
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBar({
  label,
  score,
  showLabel = true,
  size = 'md',
}: ScoreBarProps) {
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size];

  const dotGap = size === 'sm' ? 'gap-1' : 'gap-1.5';

  const getDotColor = (index: number): string => {
    const filled = index < score;
    if (!filled) return 'rgba(255,255,255,0.15)';
    if (score <= 2) return '#c2785c';
    if (score === 3) return '#D4A373';
    return '#7EB5CC';
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span
          className="text-sm whitespace-nowrap min-w-[100px]"
          style={{ color: 'var(--color-white-60)', fontFamily: 'var(--font-body)' }}
        >
          {label}
        </span>
      )}

      <div className={`flex ${dotGap}`} aria-label={`${label}: ${score} out of 5`}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`${dotSize} rounded-full transition-all duration-200`}
            style={{ background: getDotColor(index) }}
          />
        ))}
      </div>

      <span
        className="font-mono text-xs ml-1"
        style={{ color: 'var(--color-white-40)' }}
      >
        {score}/5
      </span>
    </div>
  );
}
