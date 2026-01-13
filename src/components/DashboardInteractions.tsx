'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { submitRatingAndGetNext } from '@/app/actions'; // We just made this
import { X, Check, EyeOff, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Movie } from '@/app/types';

export default function DashboardInteractions({
    initialMovies,
    userId
}: {
    initialMovies: Movie[],
    userId: string
}) {
    const [queue, setQueue] = useState<Movie[]>(initialMovies);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | 'down' | null>(null);
    const [loadingNext, setLoadingNext] = useState(false);

    // Motion Values for Drag
    const x = useMotionValue(0);
    const y = useMotionValue(0); // We'll use this just for tracking, but mainly we care about drag offset
    // Rotate based on X (tilt)
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    // Opacity fade out when near edges
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

    // If queue gets low, we might need a backup fetch, but our logic below handles it per-card.
    const currentMovie = queue[currentIndex];

    // --- 1. HANDLE "HAVEN'T SEEN" (SKIP) ---
    // Logic: Do NOT save. Just show next card.
    // If we skip, we don't get personalized recs, we just move to the next pre-loaded one.
    const handleSkip = () => {
        setDirection('down');
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setDirection(null);
        }, 250);
    };

    // --- 2. HANDLE RATING (LIKE/DISLIKE) ---
    // Logic: Save -> Server decides next movies -> Add to Queue
    const handleRate = async (liked: boolean) => {
        if (!currentMovie) return;
        setDirection(liked ? 'right' : 'left');

        // 1. Move UI immediately (Optimistic)
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setDirection(null);
        }, 250);

        // 2. Talk to Server in background
        setLoadingNext(true);
        try {
            // Use "as any" if types are strict, or map the movie object correctly
            const newRecommendations = await submitRatingAndGetNext(
                userId,
                {
                    id: currentMovie.id,
                    title: currentMovie.title,
                    poster_path: currentMovie.poster_path || ''
                },
                liked
            );

            // 3. Add new smart suggestions to the END of our queue
            // Filter out any duplicates that might already be in the queue
            const existingIds = new Set(queue.map(m => m.id));
            const uniqueNew = (newRecommendations as unknown as Movie[]).filter(m => !existingIds.has(m.id));

            setQueue(prev => [...prev, ...uniqueNew]);

        } catch (error) {
            console.error("Failed to fetch next chain:", error);
        } finally {
            setLoadingNext(false);
        }
    };

    // --- 3. HANDLE DRAG END ---
    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100; // Pixels to trigger action
        const { x: dragX, y: dragY } = info.offset;

        if (dragX > threshold) {
            handleRate(true); // Swipe Right -> Like
        } else if (dragX < -threshold) {
            handleRate(false); // Swipe Left -> Dislike
        } else if (dragY > threshold) {
            handleSkip(); // Swipe Down -> Skip
        }
    };

    // --- EMPTY STATE ---
    if (!currentMovie) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-6 bg-gray-900/50 rounded-3xl border border-white/10">
                {loadingNext ? (
                    <>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold">Curating your next match...</h2>
                    </>
                ) : (
                    <>
                        <Check className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Queue Empty!</h2>
                        <p className="text-gray-400">Refresh to start a new session.</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold">
                            Refresh
                        </button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full h-[600px] max-w-sm mx-auto perspective-1000">
            <AnimatePresence>
                <motion.div
                    key={currentMovie.id}
                    // Swipe Animation Logic
                    style={{ x, rotate, opacity }} // Bind motion values
                    drag // Enable dragging
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Snap back on release
                    dragElastic={{ top: 0, bottom: 0.5, left: 1, right: 1 }} // Prevent dragging up (top: 0), damp down drag
                    dragDirectionLock={true} // Lock direction once gesture starts
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.95, opacity: 0, y: 50 }}
                    animate={{
                        scale: 1,
                        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                        y: direction === 'down' ? 300 : 0, // Down animation for skip
                        rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
                        opacity: direction ? 0 : 1
                    }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing will-change-transform" // Hardware acceleration
                >
                    {/* IMAGE */}
                    <div className="relative h-4/5 w-full bg-gray-800">
                        {currentMovie.poster_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${currentMovie.poster_path}`}
                                alt={currentMovie.title}
                                fill
                                className="object-cover pointer-events-none"
                                priority
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>

                    {/* CONTROLS */}
                    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent pt-24">
                        <h2 className="text-2xl font-bold leading-tight mb-1 line-clamp-1">{currentMovie.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-300 mb-6">
                            <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                <Star className="w-3.5 h-3.5 fill-yellow-400" /> {currentMovie.vote_average?.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{currentMovie.release_date?.split('-')[0]}</span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center justify-between gap-4">

                            {/* DISLIKE */}
                            <button
                                onClick={() => handleRate(false)}
                                className="w-16 h-16 rounded-full bg-gray-900/80 border border-white/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-lg"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {/* HAVEN'T SEEN (SKIP) */}
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-4 bg-white/10 backdrop-blur-md rounded-full font-bold text-center hover:bg-white/20 transition-all border border-white/10 text-sm flex flex-col items-center justify-center gap-1"
                            >
                                <span className="flex items-center gap-2">
                                    <EyeOff className="w-4 h-4" /> Not Seen
                                </span>
                            </button>

                            {/* LIKE */}
                            <button
                                onClick={() => handleRate(true)}
                                className="w-16 h-16 rounded-full bg-gray-900/80 border border-white/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white hover:scale-110 transition-all shadow-lg"
                            >
                                <Check className="w-8 h-8" />
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
