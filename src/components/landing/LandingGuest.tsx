'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, Zap, ArrowRight, Info, CheckCircle, Film, PlayCircle, X } from 'lucide-react';
import { Movie } from '@/app/types';
import { useEffect, useState } from 'react';
import { fetchTrendingMovies, fetchMovieTrailer } from '@/app/actions';

export default function LandingGuest() {
    // Client-side fetch for the background to avoid Server Component conflicts in this specific setup
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    useEffect(() => {
        const loadTrending = async () => {
            try {
                const movies = await fetchTrendingMovies();
                if (movies && movies.length > 0) setHeroMovie(movies[0] as unknown as Movie);
            } catch (e) { console.error(e); }
        };
        loadTrending();
    }, []);

    const handleWatchTrailer = async () => {
        if (!heroMovie) return;

        // If we already have the key, just open
        if (trailerKey) {
            setIsTrailerOpen(true);
            return;
        }

        // Fetch
        const key = await fetchMovieTrailer(heroMovie.id);
        if (key) {
            setTrailerKey(key);
            setIsTrailerOpen(true);
        } else {
            console.warn("No trailer found");
            // Optionally show a toast here
        }
    };

    return (
        <div className="min-h-screen w-full bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">

            {/* =========================================
          HERO SECTION
         ========================================= */}
            <section className="relative h-screen w-full flex flex-col justify-center">

                {/* A. The Background Image */}
                <div className="absolute inset-0 z-0">
                    {heroMovie && (
                        <Image
                            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`}
                            alt="Hero Background"
                            fill
                            className="object-cover transition-opacity duration-1000"
                            priority
                        />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                </div>

                {/* B. The Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 animate-in slide-in-from-left-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Trending #1 Worldwide
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl shadow-black drop-shadow-lg">
                        <span className="text-blue-400 italic font-serif block mb-2">{heroMovie?.title || "Cinema"}</span>
                        is trending today. <br />
                        <span className="text-white">But is it right for <span className="underline decoration-blue-500 underline-offset-8">you</span>?</span>
                    </h1>

                    <p className="text-gray-200 text-lg md:text-xl max-w-xl mb-10 leading-relaxed drop-shadow-md font-medium">
                        Don&apos;t trust the average rating. Our AI analyzes your psychology to predict your exact match score before you press play.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 max-w-lg">
                        {/* 1. Primary Action */}
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]"
                        >
                            Check My Match Score <ArrowRight className="w-5 h-5" />
                        </Link>

                        {/* 2. Embedded Trailer (Elongated Pill) */}
                        {heroMovie && (
                            <button
                                onClick={handleWatchTrailer}
                                className="px-8 py-4 bg-red-600/90 text-white font-bold text-lg rounded-full hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                            >
                                <PlayCircle className="w-5 h-5" /> Watch Trailer
                            </button>
                        )}

                        {/* 3. Info Link (Glass) */}
                        {heroMovie && (
                            <Link
                                href={`/movie/${heroMovie.id}`}
                                className="px-8 py-4 bg-black/40 backdrop-blur-md border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Info className="w-5 h-5" /> Info
                            </Link>
                        )}
                    </div>

                    {/* Movie Metadata Tags */}
                    <div className="mt-12 flex flex-wrap items-center gap-4 text-xs md:text-sm font-bold text-gray-300">
                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded backdrop-blur-sm">
                            IMDb {heroMovie?.vote_average?.toFixed(1) || "8.5"}
                        </div>
                        <div className="px-3 py-1 bg-white/10 border border-white/10 rounded backdrop-blur-sm">
                            {heroMovie?.release_date?.split('-')[0] || "2024"}
                        </div>
                    </div>
                </div>
            </section>

            {/* TRAILER MODAL OVERLAY */}
            {isTrailerOpen && trailerKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <button
                        onClick={() => setIsTrailerOpen(false)}
                        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-8 h-8 text-white" />
                    </button>

                    <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                            title="Movie Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}


            {/* =========================================
          SOCIAL PROOF
         ========================================= */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                        Aggregating data from
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-xl font-bold font-serif tracking-tighter">IMDb</span>
                        <span className="text-xl font-black font-sans tracking-wide">TMDB</span>
                        <span className="text-xl font-bold font-mono">ROTTEN TOMATOES</span>
                    </div>
                </div>
            </section>

            {/* =========================================
          BENTO GRID FEATURES
         ========================================= */}
            <section className="py-24 px-6 bg-black relative">
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto">

                    {/* HEADER WITH THE QUOTE */}
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                            &quot;Life is too short for <br className="hidden md:block" /> bad movies.&quot;
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            We stripped away the ads, the tracking, and the clutter. What&apos;s left is the purest way to find cinema that actually moves you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* 1. Large AI Card */}
                        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">It reads your mind.</h3>
                                <p className="text-gray-400 text-lg max-w-md">
                                    We don&apos;t just recommend &quot;Action.&quot; We analyze mood, pacing, cinematography, and plot complexity to find matches that resonate with your personality.
                                </p>
                            </div>
                        </div>

                        {/* 2. Speed Card */}
                        <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Lightning Fast.</h3>
                            <p className="text-gray-400 text-sm">
                                Get a curated list of 20 movies in under 1.2 seconds. No scrolling paralysis.
                            </p>
                        </div>

                        {/* 3. Privacy Card */}
                        <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-green-500/30 transition-colors">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-green-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Privacy First.</h3>
                            <p className="text-gray-400 text-sm">
                                You are the customer, not the product. We never sell your viewing data to advertisers.
                            </p>
                        </div>

                        {/* 4. Wide Feature List */}
                        <div className="col-span-1 md:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 space-y-6">
                                <h3 className="text-2xl font-bold">Curated by Humans & AI.</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <span>Filter by Streaming Service (Netflix, Prime)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <span>Exclude genres you hate (e.g., Horror)</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1 w-full h-40 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                                <Film className="w-10 h-10 text-gray-700" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. FINAL CALL TO ACTION */}
            <section className="py-32 px-6 text-center bg-gradient-to-b from-black to-gray-900">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to watch something good?</h2>
                    <Link
                        href="/login"
                        className="inline-block px-12 py-5 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-xl shadow-white/10"
                    >
                        Start Curating Now
                    </Link>
                    <p className="mt-6 text-sm text-gray-500">Free forever. No credit card required.</p>
                </div>
            </section>

        </div>
    );
}