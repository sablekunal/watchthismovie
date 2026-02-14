import { getMoviesBySlug, parseSlug } from '@/lib/slug-parser';
import SmartMovieCard from '@/components/SmartMovieCard';
import { createClient } from '@/lib/supabaseServer';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const filters = parseSlug(slug);

    return {
        title: `${filters.title} | WatchThisMovie`,
        description: filters.description,
        openGraph: {
            title: filters.title,
            description: filters.description,
        },
    };
}

export default async function CollectionPage({ params }: PageProps) {
    const { slug } = await params;
    const { movies, filters } = await getMoviesBySlug(slug);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {filters.title}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        {filters.description}
                    </p>

                    {/* Tags / Filters Display */}
                    <div className="flex flex-wrap gap-2">
                        {filters.mood && (
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm border border-purple-500/20">
                                Mood: {filters.mood}
                            </span>
                        )}
                        {filters.audience && (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                                For: {filters.audience}
                            </span>
                        )}
                        {filters.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 text-xs text-gray-500 items-center">
                                <span>Keywords:</span>
                                {filters.keywords.map(k => (
                                    <span key={k} className="bg-gray-800 px-2 py-0.5 rounded">{k}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Movies Grid */}
                {movies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map((movie: any) => (
                            <SmartMovieCard
                                key={movie.id}
                                movie={movie}
                                userId={user?.id || 'anon'}
                                isSeen={false} // We don't fetch seen status here for speed/simplicity, logic handles strict 'isSeen' in the card usually? 
                            // Actually SmartMovieCard takes 'isSeen' as prop. 
                            // Optimization: We could fetch interactions to know if seen.
                            // For now, default false is acceptable for SEO pages, or we can fetch.
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <p className="text-2xl text-gray-500">No movies found matching this vibe.</p>
                        <p className="text-gray-600">Try a different combination?</p>
                    </div>
                )}

            </div>
        </div>
    );
}
