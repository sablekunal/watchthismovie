import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Instagram, Globe, Lock, Share2, Twitter, Linkedin, Link as LinkIcon, Youtube, ArrowRight, Pin, Flag } from 'lucide-react';
import CinephileCard from '@/components/profile/CinephileCard';
import StatsDisplay from '@/components/profile/StatsDisplay';
import { getUserTasteProfile } from '@/lib/taste';
import RecentActivity from '@/components/profile/RecentActivity';
import ReportButton from '@/components/profile/ReportButton';
import ShareButton from '@/components/profile/ShareButton';

// DYNAMIC METADATA (For Viral Sharing)
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    return {
        title: `${username}'s Cinephile Card`,
        description: `Check out ${username}'s movie stats and top favorites on WatchThisMovie.`,
        openGraph: {
            images: [`/api/og?username=${username}`],
        },
    };
}

// Helper for Social Icons
const SocialIcon = ({ platform }: { platform: string }) => {
    switch (platform) {
        case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
        case 'twitter': return <Twitter className="w-5 h-5 text-blue-400" />;
        case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-600" />;
        case 'youtube': return <Youtube className="w-5 h-5 text-red-600" />;
        case 'letterboxd': return <div className="w-5 h-5 flex items-center justify-center font-bold text-[8px] tracking-tighter bg-orange-500 text-black rounded-sm">L</div>; // Custom L icon
        default: return <LinkIcon className="w-5 h-5 text-gray-400" />;
    }
};

const getSocialUrl = (platform: string, handle: string) => {
    if (platform === 'website') return handle;
    if (handle.startsWith('http')) return handle;
    switch (platform) {
        case 'instagram': return `https://instagram.com/${handle}`;
        case 'twitter': return `https://twitter.com/${handle}`;
        case 'linkedin': return `https://linkedin.com/in/${handle}`;
        case 'letterboxd': return `https://letterboxd.com/${handle}`;
        case 'youtube': return `https://youtube.com/@${handle}`;
        default: return handle;
    }
}

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (!profile) return notFound();

    // 2. Privacy Check
    if (profile.is_public === false) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-gray-500">
                <Lock className="w-12 h-12 mb-4" />
                <h1 className="text-2xl font-bold">This profile is private.</h1>
            </div>
        );
    }

    // 3. Fetch Data (Taste & Stats)
    const tasteProfile = await getUserTasteProfile(profile.id, supabase);

    // Default values
    const watchedCount = tasteProfile?.totalWatched || 0;
    const topGenres = tasteProfile?.topGenres || [];

    // RECENT WATCHES: Prefer Manual (>0), else Auto
    // Ensure recent_watches is an array and correct type
    const manualRecents: any[] = Array.isArray(profile.recent_watches) ? profile.recent_watches : [];
    const recentMovies = (manualRecents.length > 0) ? manualRecents : (tasteProfile?.recentMovies || []);

    // Fetch specific counts for StatsDisplay
    const { count: likedCount } = await supabase.from('user_interactions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('liked', true);
    const { count: dislikedCount } = await supabase.from('user_interactions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('liked', false);

    const topFavorites = profile.top_favorites || [];

    const showStats = profile.show_stats_publicly !== false;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* BACKGROUND GLOW */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                    {/* LEFT: The Card */}
                    <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                        <CinephileCard
                            username={profile.username}
                            fullName={profile.full_name}
                            level={tasteProfile?.level || "Rookie"}
                            avatarUrl={profile.avatar_url}
                            stats={{ watched: watchedCount || 0, hours: (watchedCount || 0) * 2 }}
                            joinDate={new Date(profile.created_at).getFullYear().toString()}
                            tags={topGenres.length > 0 ? topGenres : ["Cinephile"]}
                        />
                    </div>

                    {/* RIGHT: Bio & Socials */}
                    <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                        <div>
                            {profile.full_name ? (
                                <>
                                    <h1 className="text-4xl md:text-6xl font-bold mb-1">{profile.full_name}</h1>
                                    <p className="text-lg text-blue-400 font-mono mb-3">@{profile.username}</p>
                                </>
                            ) : (
                                <h1 className="text-4xl md:text-6xl font-bold mb-2">{profile.username}</h1>
                            )}
                            <div className="flex items-center gap-3">
                                <p className="text-xl text-gray-400">{profile.bio || "No bio yet."}</p>
                                <ShareButton />
                            </div>
                        </div>

                        {/* STATS (Advanced & Private) - No Emojis */}
                        {showStats && (
                            <div className="max-w-md mx-auto md:mx-0">
                                <StatsDisplay
                                    watchedCount={watchedCount || 0}
                                    likedCount={likedCount || 0}
                                    dislikedCount={dislikedCount || 0}
                                />
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {profile.social_links && Object.entries(profile.social_links).map(([platform, handle]) => (
                                <a
                                    key={platform}
                                    href={getSocialUrl(platform as string, handle as string)}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow ugc"
                                    className="p-3 bg-white/5 rounded-full hover:bg-white/20 transition-colors border border-white/5"
                                    title={platform}
                                >
                                    <SocialIcon platform={platform} />
                                </a>
                            ))}
                        </div>

                        {/* Public Note (Notepad Style) */}
                        {profile.public_note && (
                            <div className="mt-8 relative group max-w-md mx-auto md:mx-0 text-left">
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                <div className="relative px-6 py-5 bg-black/80 ring-1 ring-white/10 rounded-lg flex items-start space-x-4">
                                    <Pin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                                    <div className="text-md text-amber-100/90 font-mono whitespace-pre-wrap leading-relaxed">
                                        {profile.public_note}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ROW 1: MUST WATCH (Top 3) --- */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold mb-8">
                        Must Watch
                    </h2>

                    {topFavorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topFavorites.map((movie: any, idx: number) => (
                                <Link key={movie.id} href={`/movie/${movie.id}`} className="group relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:border-white/30 transition-all">
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
                                            alt={movie.title || 'Movie'}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">No Image</div>
                                    )}

                                    {/* Rank Number */}
                                    <div className="absolute -bottom-4 -right-4 text-9xl font-bold text-white/5 group-hover:text-white/20 transition-colors pointer-events-none">
                                        {idx + 1}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <span className="font-bold text-lg">{movie.title}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center text-gray-500">
                            <p className="mb-2">User hasn&apos;t selected their Must Watch movies yet.</p>
                        </div>
                    )}
                </div>

                {/* --- ROW 2: TASTE DNA + RECENT --- */}
                {showStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">

                        {/* TASTE DNA */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Taste DNA</h2>
                            {topGenres.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {topGenres.map(genre => (
                                        <div key={genre} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-default text-gray-300">
                                            {genre}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Not enough data to analyze taste.</p>
                            )}
                        </div>

                        {/* RECENTLY WATCHED */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Recently Watched</h2>
                                {/* Future: Link to full histoy */}
                            </div>
                            <RecentActivity movies={recentMovies} />
                            {recentMovies.length === 0 && <p className="text-gray-500 italic">No recent activity.</p>}
                        </div>

                    </div>
                )}

                {/* REPORT BUTTON */}
                <div className="flex justify-center mt-12 mb-8">
                    <ReportButton username={username} />
                </div>

            </div>
        </div>
    );
}
