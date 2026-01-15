'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({
    url,
    title = "Share Profile"
}: {
    url?: string;
    title?: string
}) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        // Determine the URL to share (default to current window)
        const shareUrl = url || typeof window !== 'undefined' ? window.location.href : '';

        if (!shareUrl) return;

        // Use Web Share API if available (Mobile Native feel)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'WatchThisMovie Profile',
                    text: 'Check out this cinephile profile on WatchThisMovie!',
                    url: shareUrl,
                });
                return;
            } catch (err) {
                // Fallback to clipboard if user cancels or errors
                console.log('Share API skipped/failed, falling back to clipboard.');
            }
        }

        // Fallback: Copy to Clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`
        px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300
        ${copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-white/10 text-white border border-white/5 hover:bg-white/20'
                }
      `}
            title={title}
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied Link!' : title}
        </button>
    );
}
