'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Check, Star } from 'lucide-react';
import RatingSlider from '@/components/RatingSlider';

interface Props {
    movie: any;
    userId: string;
    isSeen: boolean;
}

export default function SmartMovieCard({ movie, userId, isSeen: initialSeen }: Props) {
    const [isSeen, setIsSeen] = useState(initialSeen);
    const [showSlider, setShowSlider] = useState(false);

    return (
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/10 shadow-md">

            {/* 1. SEEN BADGE (Top Right) */}
            {isSeen && (
                <div className="absolute top-2 right-2 z-20 bg-green-500 text-black p-1 rounded-full shadow-lg">
                    <Check className="w-3 h-3 stroke-[4]" />
                </div>
            )}

            {/* 2. THE TICK BUTTON (Bottom Right) */}
            {/* Only show if NOT seen yet. This is your "Tick Shape Button" */}
            {!isSeen && !showSlider && (
                <button
                    className="absolute bottom-2 right-2 z-30 w-10 h-10 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                    onClick={(e) => {
                        e.preventDefault(); // Stop navigation
                        e.stopPropagation(); // Stop bubble
                        setShowSlider(true);
                    }}
                    suppressHydrationWarning
                >
                    <Check className="w-5 h-5" />
                </button>
            )}

            {/* 3. THE EXPANDED SLIDER (Replaces Tick Button) */}
            {showSlider && (
                <div className="absolute bottom-2 left-2 right-2 z-30 animate-in zoom-in-95 duration-200">
                    <RatingSlider
                        movie={{ id: movie.id, title: movie.title, poster_path: movie.poster_path }}
                        userId={userId}
                        variant="mini"
                        onRate={() => {
                            setIsSeen(true);
                            setShowSlider(false);
                        }}
                    />
                    {/* Close area: clicking outside the slider closes it */}
                    <div
                        className="fixed inset-0 z-[-1]"
                        onClick={(e) => { e.stopPropagation(); setShowSlider(false); }}
                    />
                </div>
            )}

            {/* 4. MAIN CONTENT */}
            <Link href={`/movie/${movie.id}`} className="block w-full h-full">
                {movie.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} // Use smaller images for performance!
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 150px, 300px" // Optimization hint
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800" />
                )}

                {/* Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-3 right-12">
                    <h3 className="text-xs font-bold text-gray-200 truncate">{movie.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                        <Star className="w-2 h-2 fill-yellow-500" /> {movie.vote_average.toFixed(1)}
                    </div>
                </div>
            </Link>
        </div>
    );
}
