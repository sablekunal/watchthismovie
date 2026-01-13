import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Use 'Inter' for that clean SaaS look
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'WatchThisMovie | AI Powered Discovery',
  description: 'Stop scrolling and start watching. Personalized movie recommendations based on your unique taste DNA.',
  manifest: '/manifest.json', // Link manifest
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: '#000000', // Matches navigation bar
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* GLOBAL NOISE TEXTURE (The Secret Sauce for Premium Feel) */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

        {/* GLOBAL GRADIENT BLURS */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full z-[-1]" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full z-[-1]" />

        <Navigation />

        {/* Content wrapper with minimum height to push footer down */}
        <main className="min-h-screen flex flex-col">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}