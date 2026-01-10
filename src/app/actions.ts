'use server'

export async function fetchTrendingMovies() {
  const key = process.env.NEXT_PUBLIC_TMDB_KEY; 
  
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${key}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!res.ok) throw new Error('Failed to fetch from TMDB');
    
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
}