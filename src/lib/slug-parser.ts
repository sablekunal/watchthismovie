import { createClient } from '@/lib/supabaseServer';

export interface SearchFilters {
    keywords: string[];
    yearRange?: { start: number; end: number };
    mood?: string;
    audience?: string;
    title: string;
    description: string;
}

export function parseSlug(slug: string): SearchFilters {
    const parts = slug.split('-');

    const filters: SearchFilters = {
        keywords: [],
        title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        description: `Discover the best ${slug.replace(/-/g, ' ')} curated just for you.`,
    };

    // 1. Extract Years (e.g., "1990s")
    const yearMatch = slug.match(/(\d{4})s/);
    if (yearMatch) {
        const startYear = parseInt(yearMatch[1]);
        filters.yearRange = { start: startYear, end: startYear + 9 };
        // filters.keywords.push(yearMatch[0]); // Don't add year to keywords if we can't filter by it effectively in text search yet
    }

    // 2. Keyword Mapping (Simple Heuristics)
    const MOOD_MAP: Record<string, string[]> = {
        'sad': ['sad', 'grief', 'cry', 'heartbreaking', 'tragedy', 'emotional'],
        'happy': ['happy', 'joy', 'fun', 'feel-good', 'comedy'],
        'mind-bending': ['mind-bending', 'psychological', 'twist', 'surreal', 'complex'],
        'thrillers': ['thriller', 'suspense', 'tension', 'danger'],
        'action': ['action', 'explosion', 'fight', 'battle'],
        'romantic': ['romance', 'love', 'couple', 'relationship'],
        'scary': ['horror', 'scary', 'fear', 'terror', 'ghost'],
        'funny': ['comedy', 'funny', 'hilarious', 'laugh'],
    };

    const AUDIENCE_MAP: Record<string, string[]> = {
        'engineers': ['science', 'technology', 'math', 'space', 'robot', 'engineering', 'geek'],
        'designers': ['art', 'design', 'visual', 'creative', 'style'],
        'kids': ['animation', 'family', 'adventure', 'cartoon'],
        'students': ['school', 'college', 'learning', 'coming of age'],
    };

    parts.forEach(part => {
        if (MOOD_MAP[part]) {
            filters.keywords.push(...MOOD_MAP[part]);
            filters.mood = part;
        }
    });

    if (slug.includes('mind-bending')) {
        filters.keywords.push(...MOOD_MAP['mind-bending']);
        filters.mood = 'Mind-Bending';
    }

    Object.keys(AUDIENCE_MAP).forEach(key => {
        if (slug.includes(key)) {
            filters.keywords.push(...AUDIENCE_MAP[key]);
            filters.audience = key;
        }
    });

    if (filters.keywords.length === 0) {
        filters.keywords = parts.filter(p => !p.match(/^\d+s$/));
    }

    return filters;
}

export async function getMoviesBySlug(slug: string) {
    const filters = parseSlug(slug);
    const supabase = await createClient(); // Await the server client creation

    let query = supabase.from('movies').select('*');

    const searchString = filters.keywords.join(' | ');

    if (searchString) {
        // Try searching in both overview and custom_blurb? 
        // For now, let's stick to overview as it's the main content.
        query = query.textSearch('overview', searchString, {
            type: 'websearch',
            config: 'english'
        });
    }

    // Date Filtering is currently disabled as 'release_date' column is missing/unverified.
    // if (filters.yearRange) { ... }

    const { data, error } = await query.limit(20);

    return {
        movies: data || [],
        filters,
        error
    };
}
