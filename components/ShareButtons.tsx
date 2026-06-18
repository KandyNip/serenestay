"use client";

import { useState } from 'react';
import { Share2, MessageSquare, Twitter, Facebook, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  destinationName: string;
  destinationSlug: string;
}

export default function ShareButtons({ destinationName, destinationSlug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const shareUrl = `https://howistoday.online/destinations/${destinationSlug}`;
  const shareText = `Check out ${destinationName} on SereneStay.ai — AI-powered healing retreat matching!`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      icon: MessageSquare,
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
