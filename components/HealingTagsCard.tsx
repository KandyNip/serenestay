interface HealingTagsCardProps {
  healingTags: string[];
  emotionalTagline: string;
}

/**
 * HealingTagsCard Component
 * Displays healing tags and emotional tagline for a destination
 * - emotionalTagline: Large serif font with light background, as emotional banner
 * - healingTags: Pill/badge style with soft healing colors (lavender/mint/sky blue)
 * - Does not render if healingTags is empty
 */
export default function HealingTagsCard({ healingTags, emotionalTagline }: HealingTagsCardProps) {
  // Don't render if no healing tags
  if (!healingTags || healingTags.length === 0) {
    return null;
  }

  // Color palette for healing tags - soft healing colors
  const tagColors = [
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];

  return (
    <div className="space-y-6">
      {/* Emotional Tagline Banner */}
      {emotionalTagline && (
        <div className="bg-gradient-to-r from-purple-50 via-emerald-50 to-sky-50 rounded-2xl p-6 shadow-card">
          <p className="font-serif text-xl sm:text-2xl text-primary/90 leading-relaxed italic">
            "{emotionalTagline}"
          </p>
        </div>
      )}

      {/* Healing Tags */}
      <div className="bg-white rounded-2xl p-6 shadow-card">
        <h3 className="font-serif text-xl text-primary mb-4">Healing Practices</h3>
        <div className="flex flex-wrap gap-2">
          {healingTags.map((tag, index) => {
            const colorClass = tagColors[index % tagColors.length];
            return (
              <span
                key={tag}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${colorClass} transition-all duration-200 hover:scale-105`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
