import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { ArrowRight, PlayCircle, Star, Database } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient'; // Client side is fine for quick interactions, or pass data from server

export default function LandingUser({ user }: { user: User }) {
  // We can greet them by name if we have it, or email
  const name = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">

      {/* Abstract Tech Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full z-10 grid md:grid-cols-2 gap-12 items-center">

        {/* Left: Briefing */}
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Online
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome back, <br />
              <span className="text-blue-500">{name}.</span>
            </h1>
            <p className="text-xl text-gray-400">
              Your Taste DNA has evolved. We've curated a fresh set of recommendations based on your recent activity.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/rate"
              className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center gap-2"
            >
              Continue Rating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/results"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Database className="w-5 h-5" /> View My Feed
            </Link>
          </div>
        </div>

        {/* Right: Stats Card (Mockup of their progress) */}
        <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-in slide-in-from-right-8 duration-700 delay-100 hover:border-blue-500/30 transition-colors">
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6">Your Profile Status</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">Active Rater</div>
                  <div className="text-xs text-gray-500">Contributing Data</div>
                </div>
              </div>
              <span className="text-green-400 font-mono text-sm">ACTIVE</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taste Accuracy</span>
                <span className="text-white font-bold">High</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[75%]" />
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed pt-2">
              "Based on your last session, we are prioritizing <strong>Thriller</strong> and <strong>Noir</strong> genres in your feed today."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}