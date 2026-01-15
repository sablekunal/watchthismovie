import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-black text-white font-sans">

            {/* Hero Section */}
            <div className="bg-black text-white py-32 px-6 relative overflow-hidden">
                {/* Background decoration to match app feeling */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10 pt-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Stop Searching. <span className="text-blue-500">Start Watching.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
                        We cure "Decision Paralysis" by finding the perfect movie for your mood in seconds.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 space-y-24">

                {/* The Mission Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-white">The Mission</h2>
                        <div className="w-16 h-1 bg-blue-600 mb-6"></div>
                        <p className="text-lg leading-relaxed text-gray-400">
                            We've all been there: scrolling through streaming services for an hour, only to re-watch <em>The Office</em> for the 100th time.
                        </p>
                        <p className="text-lg leading-relaxed text-gray-400 mt-4">
                            <strong>WatchThisMovie</strong> was built to solve this. It's a minimalist, no-nonsense recommendation engine that cuts through the noise and delivers high-quality picks based on what you actually like.
                        </p>
                    </div>
                    {/* Efficiency Visualization */}
                    <div className="bg-white/5 rounded-2xl h-64 flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                        <div className="text-center z-10">
                            <div className="text-5xl font-black text-white mb-2 tracking-tighter">15m <span className="text-blue-500">→</span> 30s</div>
                            <span className="text-gray-500 font-medium uppercase tracking-widest text-xs">Average Decision Time Reduced</span>
                        </div>
                    </div>
                </section>

                {/* The Developer Section (Portfolio Flex) */}
                <section className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                    {/* Decorative */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />

                    <div className="text-center mb-10 relative z-10">
                        <h2 className="text-3xl font-bold mb-2 text-white">Who is Behind This?</h2>
                        <p className="text-gray-500 uppercase tracking-wide text-sm font-bold">The Developer Mind</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        {/* Initial Circle */}
                        <div className="shrink-0">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] border-4 border-black/50">
                                <img src="https://avatars.githubusercontent.com/u/186178187" alt="" sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' className='rounded-full' />
                            </div>
                        </div>

                        <div className="text-center md:text-left">
                            <p className="text-lg text-gray-300 mb-4">
                                Hi, I'm a <strong> B.Tech Student</strong>, a passionate developer and a cinephile.
                            </p>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                I believe that the best code is the one that solves a real human problem.
                                I built this project to combine my love for cinema with my journey into
                                <span className="text-white font-medium"> Full Stack Development</span> and <span className="text-white font-medium">AI Integration</span>.
                            </p>

                            {/* Tech Stack Pills - Great for Portfolio */}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                {['Next.js 14', 'Supabase', 'Tailwind CSS', 'OpenAI Logic', 'TMDB API'].map((tech) => (
                                    <span key={tech} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-300 shadow-sm hover:bg-white/10 hover:border-white/30 transition-colors cursor-default">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <div className="text-center pt-8 pb-12">
                    <h3 className="text-3xl font-bold mb-8 text-white">Ready to find your next favorite film?</h3>
                    <Link href="/" className="group inline-flex items-center gap-2 bg-white text-black font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105">
                        Start Exploring
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>

            </div>
        </div>
    );
}
