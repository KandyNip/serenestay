'use client';

interface HealingTag {
  label: string;
  value: string;
}

interface HealingChipsProps {
  tags: string[];
  healingTags: HealingTag[];
  size?: 'sm' | 'md';
  activeColor?: string;
}

export default function HealingChips({
  tags,
  healingTags,
  size = 'md',
  activeColor = 'var(--color-canopy)',
}: HealingChipsProps) {
  const labelMap: Record<string, string> = {};
  healingTags.forEach((t) => {
    labelMap[t.value] = t.label;
  });

  const getLabel = (value: string): string => {
    if (labelMap[value]) return labelMap[value];
    return value
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`${sizeClasses[size]} rounded-full font-medium`}
          style={{
            background: `${activeColor}20`,
            color: activeColor,
            border: `1px solid ${activeColor}30`,
            fontFamily: 'var(--font-body)',
          }}
        >
          {getLabel(tag)}
        </span>
      ))}
    </div>
  );
}
