import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  destinationName: string;
}

/**
 * YouTubeEmbed Component
 * Embeds a YouTube video player for a destination
 * - Uses official YouTube embed URL
 * - Responsive 16:9 aspect ratio
 * - Does not render if videoId is empty
 */
export default function YouTubeEmbed({ videoId, destinationName }: YouTubeEmbedProps) {
  if (!videoId) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <Play className="w-5 h-5 text-red-600 fill-red-600" />
        </div>
        <h2 className="font-serif text-xl text-primary">
          See {destinationName} in Action
        </h2>
      </div>
      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={`${destinationName} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
}
