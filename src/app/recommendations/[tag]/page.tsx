import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import SmartMovieCard from '@/components/SmartMovieCard';
import { getRecommendationsByTag } from '@/app/actions';
import { TMDBMovie } from '@/app/actions'; // Assuming TMDBMovie is exported or I will redefine locally if not

// Local declaration removed in favor of import from @/app/actions

type Props = {
    params: Promise<{ tag: string }>
}

// 1. Dynamic SEO Title & Description
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag).replace(/-/g, ' ');
    const titleTag = decodedTag.replace(/\b\w/g, l => l.toUpperCase()); // Capitalize

    return {
        title: `Best Movies for ${titleTag} | WatchThisMovie`,
        description: `Don't waste time scrolling. Here are the top rated movies specifically for "${titleTag}", curated by AI.`,
        openGraph: {
            title: `Best Movies for ${titleTag}`,
            description: `Stop scrolling. See the best movies for ${titleTag} curated by AI.`,
            images: [
                {
                    url: `/api/og?title=${encodeURIComponent(titleTag)}`,
                    width: 1200,
                    height: 630,
                },
            ],
        },
        alternates: {
            canonical: `https://watchthismovie.online/recommendations/${tag}`,
        }
    }
}

// Import ShareButton (adding import since it wasn't there)
import ShareButton from '@/components/ShareButton';

// Import the new Client Component
import RecommendationsGrid from '@/components/RecommendationsGrid';

export default async function Page({ params }: Props) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag).replace(/-/g, ' ');
    const titleTag = decodedTag.replace(/\b\w/g, l => l.toUpperCase());

    // Supabase for User ID (needed for SmartMovieCard)
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch movies (Page 1)
    const movies = await getRecommendationsByTag(decodedTag, 1);

    // Fetch seen movies if user is logged in
    let seenIds: number[] = [];
    if (user) {
        const { data: seenData } = await supabase
            .from('user_interactions')
            .select('movie_id')
            .eq('user_id', user.id);

        if (seenData) {
            seenIds = seenData.map((x: any) => x.movie_id);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                        Best Movies for "{titleTag}"
                    </h1>
                    <p className="text-xl text-gray-400">
                        Curated recommendations for <strong>{titleTag}</strong>.
                    </p>
                </div>
                <ShareButton title={titleTag} />
            </div>

            <RecommendationsGrid
                initialMovies={movies}
                tag={decodedTag}
                userId={user?.id || 'guest'}
                seenIds={seenIds}
            />
        </div>
    );
}
