'use client';

import { useState } from 'react';
import SmartMovieCard from '@/components/SmartMovieCard';
import { TMDBMovie, getRecommendationsByTag } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface Props {
    initialMovies: TMDBMovie[];
    tag: string;
    userId: string;
    seenIds: number[]; // Array for serialization
}

export default function RecommendationsGrid({ initialMovies, tag, userId, seenIds: initialSeenIds }: Props) {
    const [movies, setMovies] = useState<TMDBMovie[]>(initialMovies);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Convert array to Set for O(1) lookups
    const seenIdSet = new Set(initialSeenIds);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const nextPage = page + 1;
            const newMovies = await getRecommendationsByTag(tag, nextPage);

            if (newMovies.length === 0) {
                setHasMore(false);
            } else {
                // Filter duplicates just in case
                const existingIds = new Set(movies.map(m => m.id));
                const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));

                if (uniqueNew.length === 0) {
                    setHasMore(false); // We kept getting duplicates, so we are probably done
                } else {
                    setMovies(prev => [...prev, ...uniqueNew]);
                    setPage(nextPage);
                }
            }
        } catch (error) {
            console.error("Failed to load more:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            {movies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                        <div key={movie.id} className="relative group animate-in fade-in duration-500">
                            <SmartMovieCard
                                movie={movie}
                                userId={userId}
                                isSeen={seenIdSet.has(movie.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500">
                    <p className="text-xl">No specific movies found for "{tag}".</p>
                    <p>Try a different keyword like "Space", "Time Travel", or "Comedy".</p>
                </div>
            )}

            {/* LOAD MORE BUTTON */}
            {movies.length > 0 && hasMore && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                            </span>
                        ) : (
                            <span>Load More Movies</span>
                        )}

                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all" />
                    </button>
                </div>
            )}
        </div>
    );
}
