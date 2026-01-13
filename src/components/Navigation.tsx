'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { searchMovies } from '@/app/actions';
import { Movie } from '@/app/types'; // Ensure you have this type or remove generic if needed
import SearchBar from './SearchBar'; // Import the new component
import {
  Search,
  Menu,
  X,
  LogOut,
  Film,
  Settings,
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // --- STATE ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Mobile Search State (Separate from Desktop SearchBar)
  const [mobileQuery, setMobileQuery] = useState('');
  const [mobileResults, setMobileResults] = useState<Movie[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---

  // 1. Get User Session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Scroll & Click Outside
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 3. Mobile Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (mobileQuery.length > 2) {
        try {
          const results = await searchMovies(mobileQuery) as unknown as Movie[];
          setMobileResults(results);
        } catch (e) { console.error(e); }
      } else {
        setMobileResults([]);
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [mobileQuery]);

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    setShowSignOutModal(false);
  };

  // Helper for active link styles
  const isActive = (path: string) => pathname === path ? "text-white font-bold" : "text-gray-400 hover:text-white transition-colors";

  // Hide on login page
  if (pathname === '/login') return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled || mobileMenuOpen
          ? 'bg-black/80 backdrop-blur-xl border-white/10'
          : 'bg-gradient-to-b from-black/80 to-transparent border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">

          {/* 1. LOGO (Left) */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 relative transition-transform group-hover:scale-110">
              <Image
                src="/wtm.svg"
                alt="WatchThisMovie"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden md:block font-bold text-white tracking-tight text-lg">WatchThisMovie</span>
          </Link>

          {/* 2. SEARCH BAR (Center - Only if logged in) */}
          {user && (
            <div className="flex-1 flex justify-center max-w-lg mx-4">
              <SearchBar />
            </div>
          )}

          {/* 3. RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-4 md:gap-6">

            {user ? (
              <>
                {/* Desktop Links */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/rate" className={isActive('/rate')}>Rate</Link>
                  <Link href="/results" className={isActive('/results')}>Recommendations</Link>
                  <Link href="/watchlist" className={isActive('/watchlist')}>Watchlist</Link>
                </nav>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-white transition-colors focus:outline-none"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="User" width={36} height={36} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 z-50">
                      <div className="px-4 py-3 border-b border-white/10 mb-1">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/ratings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Film className="w-4 h-4" /> My Ratings
                      </Link>

                      <Link
                        href="/watchlist"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Film className="w-4 h-4" /> My Watchlist
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => { setProfileOpen(false); setShowSignOutModal(true); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not Logged In */
              <Link href="/login" className="px-6 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-200 transition-colors">
                Sign In
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 animate-in slide-in-from-top-10 md:hidden">
          {user ? (
            <div className="space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                />
                {mobileResults.length > 0 && (
                  <div className="mt-2 bg-gray-800 rounded-xl overflow-hidden">
                    {mobileResults.slice(0, 3).map(m => (
                      <Link
                        key={m.id}
                        href={`/movie/${m.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-3 border-b border-white/5 text-sm"
                      >
                        {m.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Link href="/rate" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">Rate Movies</Link>
                <Link href="/results" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">Recommendations</Link>
                <Link href="/watchlist" onClick={() => setMobileMenuOpen(false)} className="block text-2xl font-bold text-white">My Watchlist</Link>
              </div>

              <div className="pt-8 border-t border-white/10">
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 mb-4">Settings</Link>
                <button onClick={() => { setMobileMenuOpen(false); setShowSignOutModal(true); }} className="text-red-500 font-bold">Sign Out</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <h2 className="text-2xl font-bold">Ready to watch?</h2>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 bg-white text-black font-bold rounded-xl text-center">
                Sign In Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* SIGN OUT MODAL */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSignOutModal(false)} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sign Out?</h3>
                <p className="text-sm text-gray-400 mt-1">You will need to verify your email to log back in.</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={() => setShowSignOutModal(false)} className="flex-1 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={confirmSignOut} className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">Yes, Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}