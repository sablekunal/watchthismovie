import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ProfileForm from '@/components/profile/ProfileForm';
import StatsDisplay from '@/components/profile/StatsDisplay';
import { getUserAnalytics } from '@/lib/analytics';
import CinephileAnalytics from '@/components/profile/CinephileAnalytics';
import ShareButton from '@/components/profile/ShareButton';

export default async function EditProfilePage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Please log in to edit your profile.</div>;

    // 1. Fetch Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 2. Fetch Advanced Stats for Display
    const { data: interactions } = await supabase
        .from('user_interactions')
        .select('liked, has_watched')
        .eq('user_id', user.id);

    const watchedCount = interactions?.filter(i => i.has_watched).length || 0;
    const likedCount = interactions?.filter(i => i.liked === true).length || 0;
    const dislikedCount = interactions?.filter(i => i.liked === false).length || 0;

    // 3. Fetch Full Analytics (Graphs)
    const analyticsData = await getUserAnalytics(user.id, supabase);

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-20">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                    <div className="flex gap-2">
                        <ShareButton url={`https://watchthismovieonline.vercel.app/cinephile/${profile.username}`} title="Share" />
                        <a
                            href={`/cinephile/${profile.username}`}
                            className="px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-full hover:bg-white/20 transition-colors border border-white/5 flex items-center gap-2"
                        >
                            Show Public View &rarr;
                        </a>
                    </div>
                </div>
                <p className="text-gray-400 mb-8">Manage your public persona, social links, and privacy settings.</p>

                {/* Stats Preview */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 text-white">Your Stats (Private View)</h2>
                    <StatsDisplay
                        watchedCount={watchedCount}
                        likedCount={likedCount}
                        dislikedCount={dislikedCount}
                    />
                </div>

                {/* Analytics Graphs (Private View) */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 text-white">Your Insights</h2>
                    <CinephileAnalytics data={analyticsData} />
                </div>

                {/* Pass data to the Client Form Component */}
                <ProfileForm initialProfile={profile} userId={user.id} />
            </div>
        </div>
    );
}
