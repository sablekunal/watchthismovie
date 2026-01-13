
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchInitialBatch } from '@/app/actions'; // NEW FUNCTION
import DashboardInteractions from '@/components/DashboardInteractions';

export default async function RatePage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch only 5 movies to start. The client will fetch more as we rate.
    const movies = await fetchInitialBatch(user.id);

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4 pb-20 overflow-hidden">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Rate to Personalize</h1>
                    <p className="text-gray-400">Swipe right to discover more like it.</p>
                </div>

                <div className="flex-1 relative min-h-[600px]">
                    <DashboardInteractions
                        initialMovies={movies as any}
                        userId={user.id}
                    />
                </div>

            </div>
        </div>
    );
}
