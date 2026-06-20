"use client";

import { useState } from 'react';
import { Share2, Twitter, Facebook, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  destinationName: string;
  destinationSlug: string;
}

export default function ShareButtons({ destinationName, destinationSlug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const shareUrl = `https://howistoday.online/destinations/${destinationSlug}`;
  const shareText = `Check out ${destinationName} on SereneStay.ai — AI-powered healing stay matching!`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.657-.547-.8 3.747c1.693.076 3.224.554 4.326 1.29.46-.39 1.065-.63 1.73-.63 1.423 0 2.576 1.155 2.576 2.578 0 1.042-.618 1.937-1.503 2.344.053.28.08.573.08.87 0 3.415-3.937 6.183-8.793 6.183-4.856 0-8.793-2.768-8.793-6.182 0-.31.027-.615.082-.913A2.573 2.573 0 0 1 3.52 11.8c0-1.423 1.153-2.578 2.576-2.578.65 0 1.243.227 1.7.603 1.122-.757 2.694-1.235 4.427-1.298l.89-4.168a.5.5 0 0 1 .396-.39l2.99.614A1.245 1.245 0 0 1 17.01 4.744zM8.21 14.537c-.688 0-1.249.561-1.249 1.25a1.25 1.25 0 0 0 2.498 0 1.25 1.25 0 0 0-1.249-1.25zm7.58 0c-.688 0-1.249.561-1.249 1.25a1.25 1.25 0 0 0 2.498 0 1.25 1.25 0 0 0-1.249-1.25zm-3.836 1.718c-.472 0-.86.15-1.076.336-.108.094-.144.18-.144.268 0 .088.036.174.144.268.216.186.604.336 1.076.336.472 0 .86-.15 1.076-.336.108-.094.144-.18.144-.268 0-.088-.036-.174-.144-.268-.216-.186-.604-.336-1.076-.336z"/>
        </svg>
      ),
      label: 'Share on Reddit',
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      color: 'hover:text-orange-600',
    },
    {
      icon: Twitter,
      label: 'Share on X',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:text-sky-500',
    },
    {
      icon: Facebook,
      label: 'Share on Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-600',
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=500,scrollbars=yes');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-card text-primary/70 hover:text-secondary transition-colors text-sm font-medium"
        aria-label="Share this destination"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {/* Share options */}
      {expanded && (
        <div className="flex items-center gap-2">
          {shareLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => handleShare(link.url)}
                className={`p-2 bg-white rounded-xl shadow-card text-primary/60 ${link.color} transition-colors`}
                aria-label={link.label}
                title={link.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="p-2 bg-white rounded-xl shadow-card text-primary/60 hover:text-secondary transition-colors"
            aria-label="Copy link"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
