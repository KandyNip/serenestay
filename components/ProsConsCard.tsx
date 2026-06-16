import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ProsConsCardProps {
  pros: string[];
  cons: string[];
}

/**
 * ProsConsCard Component
 * Displays pros and cons for a destination
 * - Pros: Green theme with ThumbsUp icon
 * - Cons: Warm amber/orange theme with ThumbsDown icon
 * - Two-column layout on large screens, stacked on mobile
 * - Does not render if both pros and cons are empty
 */
export default function ProsConsCard({ pros, cons }: ProsConsCardProps) {
  // Don't render if no data
  if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) {
    return null;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Pros Section */}
      {pros && pros.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-secondary/15 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="font-serif text-xl text-primary">Pros</h3>
          </div>
          <ul className="space-y-3">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                </div>
                <span className="text-primary/80 text-sm leading-relaxed">{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons Section */}
      {cons && cons.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-serif text-xl text-primary">Cons</h3>
          </div>
          <ul className="space-y-3">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                </div>
                <span className="text-primary/80 text-sm leading-relaxed">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
