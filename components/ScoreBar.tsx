interface ScoreBarProps {
  label: string;
  score: number; // 1-5
  color?: 'green' | 'yellow' | 'red' | 'auto';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ScoreBar Component
 * Displays a 5-point score with colored dots
 * Colors: 1-2=red, 3=yellow, 4-5=green (auto mode)
 */
export default function ScoreBar({
  label,
  score,
  color = 'auto',
  showLabel = true,
  size = 'md',
}: ScoreBarProps) {
  // Determine dot color based on score
  const getDotColor = (index: number): string => {
    if (color !== 'auto') {
      return color === 'green' 
        ? 'bg-secondary' 
        : color === 'yellow' 
          ? 'bg-warning' 
          : 'bg-danger';
    }
    
    const filled = index < score;
    if (!filled) return 'bg-primary/20';
    
    if (score <= 2) return 'bg-danger';
    if (score === 3) return 'bg-warning';
    return 'bg-secondary';
  };

  // Dot size based on prop
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size];

  // Gap between dots
  const dotGap = size === 'sm' ? 'gap-1' : 'gap-1.5';

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm text-primary/80 whitespace-nowrap min-w-[100px]">
          {label}
        </span>
      )}
      
      {/* Score dots container */}
      <div className={`flex ${dotGap}`} aria-label={`${label}: ${score} out of 5`}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`${dotSize} rounded-full transition-all duration-200 ${getDotColor(index)}`}
          />
        ))}
      </div>
      
      {/* Score number */}
      <span className="font-mono text-xs text-primary/60 ml-1">
        {score}/5
      </span>
    </div>
  );
}
