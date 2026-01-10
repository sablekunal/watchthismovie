'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import { Movie } from '../types'; 
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { User } from '@supabase/supabase-js'; 
import { fetchTrendingMovies } from '../actions'; // Imports from the file we just made

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null); 
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(50);
  const router = useRouter();
  
  const supabase = createClient();

  // 1. Authentication Check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/'); 
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router, supabase]);

  // 2. Load Movies (Securely from Server)
  useEffect(() => {
    async function load() {
      const trending = await fetchTrendingMovies(); 
      setMovies(trending);
    }
    load();
  }, []);

  const handleRate = async (hasWatched: boolean) => {
    if (!user || !movies[currentIndex]) return;

    const currentMovie = movies[currentIndex];

    // STEP A: Cache Movie
    const { error: movieError } = await supabase
      .from('movies')
      .upsert({
        id: currentMovie.id,
        title: currentMovie.title,
        poster_path: currentMovie.poster_path,
        backdrop_path: currentMovie.backdrop_path,
        overview: currentMovie.overview,
        release_date: currentMovie.release_date,
        tmdb_rating: currentMovie.vote_average,
      });

    if (movieError) console.error("Movie Cache Error:", movieError);

    // STEP B: Save Rating
    const { error: ratingError } = await supabase
      .from('user_interactions')
      .upsert({
        user_id: user.id,
        movie_id: currentMovie.id,
        has_watched: hasWatched,
        rating: hasWatched ? rating : null,
        liked: rating > 70
      }, { onConflict: 'user_id, movie_id' }) 
      .select();

    if (ratingError) {
      console.error("Mind Read Error:", ratingError);
    }

    setCurrentIndex((prev) => prev + 1);
    setRating(50);
  };

  const movie = movies[currentIndex];

  if (!user || !movie) return <div className="bg-black h-screen text-white flex items-center justify-center">Loading Mind Reader...</div>;

  // ... imports stay the same ...

  return (
    <div className="min-h-screen w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat bg-black flex flex-col items-center justify-center p-4">
      
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-sm flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Rate Movies</h1>
          <p className="text-sm text-gray-400">Teach the AI your taste.</p>
        </div>
        <button 
          onClick={() => router.push('/results')}
          className="group flex items-center gap-2 pl-4 pr-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
        >
          <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300">GET RESULTS</span>
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </button>
      </div>

      {/* The "Pro" Card */}
      <div className="relative z-10 w-full max-w-sm aspect-[2/3] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        
        {/* Poster Image */}
        <Image 
          src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`} 
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient Overlay (Cinematic Fade) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          
          <h2 className="text-3xl font-bold leading-none mb-2 drop-shadow-lg">{movie.title}</h2>
          <div className="flex gap-2 mb-6">
             <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
               {movie.release_date?.split('-')[0]}
             </span>
             <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
               ★ {movie.vote_average.toFixed(1)}
             </span>
          </div>

          {/* Interactions */}
          <div className="space-y-4">
            
            {/* The Slider */}
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-medium text-gray-400">
                 <span>Not for me</span>
                 <span className={rating > 70 ? "text-green-400" : rating < 40 ? "text-red-400" : "text-white"}>{rating}% Match</span>
                 <span>Masterpiece</span>
               </div>
               <input 
                 type="range" 
                 min="0" max="100" value={rating} 
                 onChange={(e) => setRating(parseInt(e.target.value))}
                 className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-blue-400 transition-colors"
               />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => handleRate(false)}
                 className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-sm text-sm font-semibold transition-all text-gray-300 hover:text-white"
               >
                 Never Seen
               </button>
               <button 
                 onClick={() => handleRate(true)}
                 className="py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10"
               >
                 Rate It
               </button>
            </div>

          </div>
        </div>
      </div>
      
      {/* Hint Text */}
      <p className="mt-6 text-xs text-gray-500 font-medium tracking-wide uppercase">
        Step {currentIndex + 1} of 20
      </p>

    </div>
  );
}