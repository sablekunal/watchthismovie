import { MetadataRoute } from 'next'

// The Base Domain
const BASE_URL = 'https://watchthismovie.online'
// Use process.env for server side
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // --- A. STATIC PAGES ---
  const staticRoutes = [
    '',           // Home
    '/about',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // --- B. DYNAMIC MOVIE PAGES (From TMDB) ---
  // The user wants "500+ pages instantly".
  // TMDB returns 20 results per page. 30 pages = 600 movies.
  let movieRoutes: MetadataRoute.Sitemap = []

  if (TMDB_KEY) {
    try {
      console.log("🗺️ Sitemap: Fetching popular movies from TMDB...");

      const fetchBatch = async (pages: number[]) => {
        const promises = pages.map(page =>
          fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`, { next: { revalidate: 86400 } })
            .then(res => {
              if (!res.ok) throw new Error(`Failed page ${page}`);
              return res.json();
            })
            .catch(err => {
              console.error(`Sitemap fetch error page ${page}:`, err);
              return { results: [] };
            })
        );
        return Promise.all(promises);
      };

      const batch = await fetchBatch([1, 2, 3, 4, 5]); // Top 100 movies
      const allMovies = batch.flatMap(data => data.results || []);

      // Deduplicate movies just in case
      const seenIds = new Set();
      movieRoutes = allMovies.filter((movie: any) => {
        if (seenIds.has(movie.id)) return false;
        seenIds.add(movie.id);
        return true;
      }).map((movie: any) => ({
        url: `${BASE_URL}/movie/${movie.id}`,
        lastModified: new Date(), // Realistically these change when reviews needed, but safe to say Today
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

      console.log(`✅ Sitemap: Generated ${movieRoutes.length} movie URLs`);

    } catch (e) {
      console.error("Sitemap TMDB Fetch Critical Error:", e);
    }
  }

  // --- C. THE "NICHE" PAGES (Moods/Genres) ---
  // Using our new /recommendations/[tag] route
  // Expanded list for "Long Tail Keywords"
  const genres = [
    'action', 'adventure', 'animation', 'comedy', 'crime',
    'documentary', 'drama', 'family', 'fantasy', 'history',
    'horror', 'music', 'mystery', 'romance', 'sci-fi',
    'thriller', 'war', 'western',
    // Moods & Specifics
    'feel-good', 'sad', 'inspiring', 'mind-bending', 'plot-twist',
    'cyberpunk', 'time-travel', 'dystopian', 'post-apocalyptic',
    'space', 'aliens', 'robots', 'zombies', 'vampires',
    'superhero', 'spy', 'heist', 'survival', 'whodunit',
    '90s', '80s', 'classic', 'noir', 'indie'
  ]

  const genreRoutes = genres.map((genre) => ({
    url: `${BASE_URL}/recommendations/${genre}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // --- D. COMBINE EVERYTHING ---
  return [...staticRoutes, ...movieRoutes, ...genreRoutes]
}
