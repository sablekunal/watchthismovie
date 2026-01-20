'use client';

import { Share2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    title: string;
    url?: string;
}

export default function ShareButton({ title, url }: Props) {
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    // Hydration Fix: Only access window on client
    useEffect(() => {
        setShareUrl(url || window.location.href);
    }, [url]);

    const handleShare = async () => {
        if (!shareUrl) return; // Not ready yet

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `WatchThisMovie: ${title}`,
                    text: `Check out these recommendations for ${title} on WatchThisMovie!`,
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all active:scale-95 text-sm font-bold text-white"
        >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied Link' : 'Share Recommendations'}
        </button>
    );
}
