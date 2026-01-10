'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Film, Sparkles, User, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Hidden on Login Page
  if (pathname === '/') return null;

  const navItems = [
    { name: 'Rate Movies', href: '/dashboard', icon: Film },
    { name: 'For You', href: '/results', icon: Sparkles },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (Left Side) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-black/95 border-r border-white/10 z-50 px-6 py-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Film className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            WatchThis
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-inner' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="pt-6 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM BAR (Fixed Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-4 pb-6 safe-area-bottom">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1">
                <div className={`p-2 rounded-full transition-all ${isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          <button onClick={handleSignOut} className="flex flex-col items-center gap-1">
             <div className="p-2 text-gray-500">
               <User className="w-6 h-6" />
             </div>
             <span className="text-[10px] font-medium text-gray-500">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}