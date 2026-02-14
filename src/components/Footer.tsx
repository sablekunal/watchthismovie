import { Twitter, Instagram, Github } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // <--- Import Image

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {/* NEW LOGO HERE */}
            <div className="w-8 h-8 relative">
              <Image
                src="/wtm.svg"
                alt="WatchThisMovie"
                fill
                className="rounded object-contain"
              />
            </div>
            <span className="font-bold text-white">WatchThisMovie</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Stop scrolling. Start watching. The AI-powered recommendation engine that knows your taste better than you do.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h3 className="font-bold text-white mb-4">Product</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/rate" className="hover:text-blue-400">Rate Movies</Link></li>
            <li><Link href="/results" className="hover:text-blue-400">Recommendations</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h3 className="font-bold text-white mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-blue-400">About Us</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Moods Column (SEO) */}
        <div>
          <h3 className="font-bold text-white mb-4">Browse by Mood</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/collections/sad-movies-for-engineers" className="hover:text-purple-400">Sad Movies for Engineers</Link></li>
            <li><Link href="/collections/mind-bending-thrillers-1990s" className="hover:text-purple-400">Mind-Bending 90s</Link></li>
            <li><Link href="/collections/romantic-comedies-for-designers" className="hover:text-purple-400">Rom-Coms for Designers</Link></li>
            <li><Link href="/collections/scary-movies-for-students" className="hover:text-purple-400">Scary Movies for Students</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="font-bold text-white mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 text-center text-xs text-gray-400">
        © 2026 WatchThisMovie. All rights reserved. Data provided by TMDB.
      </div>
    </footer>
  );
}