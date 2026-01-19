'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { Info, Star, TrendingUp, Compass, PlayCircle } from 'lucide-react';
import { Movie } from '@/app/types';
import RatingSlider from '@/components/RatingSlider';

export default function LandingUser({ user, bestMatch }: { user: User, bestMatch: Movie }) {
  const router = useRouter();
  const name = user.user_metadata?.full_name || user.email?.split('@')[0];

  if (!bestMatch) return null;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        <Image
          src={`https://image.tmdb.org/t/p/original${bestMatch.poster_path}`}
          alt={bestMatch.title}
          fill
          className="object-cover opacity-60 md:opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 md:via-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end md:justify-center p-6 md:p-12 max-w-7xl mx-auto">

        {/* Top Badge */}
        <div className="absolute top-6 left-6 md:static md:mb-8 animate-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <TrendingUp className="w-3 h-3" /> Top Pick For You
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-end md:items-center">

          {/* TEXT CONTENT */}
          <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-8 duration-700">

            <h1 className="text-4xl md:text-7xl font-bold leading-tight drop-shadow-2xl">
              <span className="block text-lg md:text-2xl font-normal text-gray-200 mb-2">Welcome back, {name}</span>
              {bestMatch.title}
            </h1>

            <div className="flex items-center gap-4 text-sm md:text-base font-bold text-gray-200">
              <span className="text-green-400">98% Match</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {bestMatch.vote_average?.toFixed(1)}
              </span>
              <span>•</span>
              <span>{bestMatch.release_date?.split('-')[0]}</span>
            </div>

            <p className="text-gray-200 line-clamp-3 md:line-clamp-4 max-w-xl text-sm md:text-lg leading-relaxed drop-shadow-md">
              {bestMatch.overview}
            </p>

            {/* --- ACTION SECTION --- */}
            <div className="pt-4 space-y-6">

              {/* 1. COMPACT SLIDER (Fixed Width) */}
              {/* Restricting width to max-w-[240px] makes it "small in length" and looks premium */}
              <div className="w-full max-w-[240px]">
                <RatingSlider
                  key={bestMatch.id} // <--- FIX: Force Reset on new movie
                  movie={{
                    id: bestMatch.id,
                    title: bestMatch.title,
                    poster_path: bestMatch.poster_path || ''
                  }}
                  userId={user.id}
                  variant="default"
                  onRate={() => {
                    // Instantly refresh to show the next movie and save to history
                    router.refresh();
                  }}
                />
              </div>

              {/* 2. NAVIGATION BUTTONS */}
              <div className="flex flex-wrap gap-3">

                {/* Explore More (Goes to Results) */}
                <Link
                  href="/results"
                  className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                >
                  <Compass className="w-5 h-5" /> Explore More
                </Link>

                {/* Info Button */}
                <Link
                  href={`/movie/${bestMatch.id}`}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Info className="w-5 h-5" /> Info
                </Link>

              </div>

            </div>
          </div>

          {/* DESKTOP POSTER ART */}
          <div className="hidden md:block justify-self-end animate-in fade-in zoom-in-95 duration-1000 delay-200">
            <div className="w-64 aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image
                src={`https://image.tmdb.org/t/p/w500${bestMatch.poster_path}`}
                alt={bestMatch.title}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          </div>

        </div>

        {/* Spacer for mobile */}
        <div className="h-24 md:h-0" />
      </div>
    </div>
  );
}