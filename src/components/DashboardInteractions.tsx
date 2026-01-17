'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { submitRatingAndGetNext } from '@/app/actions';
import { X, Check, EyeOff, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import RatingSlider from '@/components/RatingSlider';
import { Movie } from '@/app/types';
import { createClient } from '@/lib/supabaseClient'; // Added import

export default function DashboardInteractions({
    initialMovies,
    userId
}: {
    initialMovies: Movie[],
    userId: string
}) {
    const [queue, setQueue] = useState<Movie[]>(initialMovies);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
    const [loadingNext, setLoadingNext] = useState(false);

    // Initialize Supabase Client
    const supabase = createClient();

    // Motion Values for Drag
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    const [ratedCount, setRatedCount] = useState(0);

    const currentMovie = queue[currentIndex]; // <--- RESTORED

    // --- 1. HANDLE "HAVEN'T SEEN" (SKIP) ---
    const handleSkip = async () => {
        setDirection('up');

        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setRatedCount(prev => prev + 1);
            setDirection(null);
        }, 250);

        if (currentMovie) {
            await supabase.from('user_interactions').insert({
                user_id: userId,
                movie_id: currentMovie.id,
                title: currentMovie.title,
                poster_path: currentMovie.poster_path, // Now required by new schema
                liked: false,
                has_watched: false
            });
        }
    };

    // --- 2. HANDLE NEXT (Instant Update from Slider) ---
    const handleNext = () => {
        // 1. Animate Out
        setDirection('right'); // Simplified: We just fly it right for success feel

        // 2. Queue logic (Append if low) handled by Slider's server call + our state
        // But for UI, we just swap card instantly
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setRatedCount(prev => prev + 1);
            setDirection(null);
        }, 300);
    };

    // --- 3. HANDLE DRAG END (Still keep swipe for power users) ---
    const handleDragEnd = async (event: any, info: PanInfo) => {
        const threshold = 100; // Pixels to trigger action
        const { x: dragX } = info.offset;

        if (dragX > threshold || dragX < -threshold) {
            const liked = dragX > threshold;
            setDirection(liked ? 'right' : 'left');

            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setRatedCount(prev => prev + 1);
                setDirection(null);
            }, 250);

            // Server Call (Manual since not using Slider)
            await submitRatingAndGetNext(userId, { id: currentMovie.id, title: currentMovie.title, poster_path: currentMovie.poster_path || '' }, liked);
        }
    };

    // --- EMPTY STATE ---
    if (!currentMovie) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-6 bg-gray-900/50 rounded-3xl border border-white/10">
                <Check className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Queue Empty!</h2>
                <p className="text-gray-400">Refresh to start a new session.</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold">
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[600px] max-w-sm mx-auto perspective-1000">
            <AnimatePresence>
                <motion.div
                    key={currentMovie.id}
                    style={{ x, rotate, opacity }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.95, opacity: 0, y: 50 }}
                    animate={{
                        scale: 1,
                        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                        y: direction === 'up' ? -300 : 0,
                        rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                        opacity: direction ? 0 : 1
                    }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing will-change-transform touch-pan-y"
                >
                    {/* IMAGE */}
                    <div className="relative h-4/5 w-full bg-gray-800">
                        {currentMovie.poster_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${currentMovie.poster_path}`}
                                alt={currentMovie.title}
                                fill
                                className="object-cover pointer-events-none"
                                priority={true} // <--- FIX: Preload Main Image (No Lag)
                                sizes="(max-width: 768px) 100vw, 500px"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>

                    {/* CONTROLS */}
                    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent pt-24">
                        <h2 className="text-2xl font-bold leading-tight mb-1 line-clamp-1">{currentMovie.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-300 mb-4">
                            <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                <Star className="w-3.5 h-3.5 fill-yellow-400" /> {currentMovie.vote_average?.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{currentMovie.release_date?.split('-')[0]}</span>
                        </div>

                        {/* REPLACING OLD BUTTONS WITH SLIDER */}
                        <div className="mt-2">
                            <RatingSlider
                                movie={{
                                    id: currentMovie.id,
                                    title: currentMovie.title,
                                    poster_path: currentMovie.poster_path || ''
                                }}
                                userId={userId}
                                variant="default" // Big Size
                                onRate={handleNext} // <--- MAGIC: Triggers next card instantly
                            />
                        </div>

                        {/* Keep "Not Seen" as a small text link below */}
                        <div className="text-center mt-4">
                            <button onClick={handleSkip} className="text-xs text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
                                Haven't Seen This
                            </button>
                        </div>

                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Background Card (Visual hint of what's next) */}
            {queue[currentIndex + 1] && (
                <div className="absolute inset-0 bg-gray-800 rounded-3xl -z-10 scale-95 translate-y-4 opacity-50 border border-white/5"></div>
            )}
        </div>
    );
}
