import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Script from "next/script";

// Use 'Inter' for that clean SaaS look
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'WatchThisMovie | AI Powered Discovery',
  description: 'Stop scrolling and start watching. Personalized movie recommendations based on your unique taste DNA.',
  manifest: '/manifest.json', // Link manifest
  icons: {
    icon: '/wtm.svg',
  },
  verification: {
    google: 'V1txDMkKDMg-_zL3D8fmW5SYM-ftq2O85qfTWLT-5ho',
  },
  metadataBase: new URL('https://watchthismovie.online'),
  alternates: {
    canonical: './',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents "Crash on Zoom" and gives native app feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* Preconnect for Noise Texture */}
        <link rel="preconnect" href="https://grainy-gradients.vercel.app" />
        {/* Preconnect for TMDB Images (LCP Optimization) */}
        <link rel="preconnect" href="https://image.tmdb.org" />

        {/* JSON-LD for Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "WatchThisMovie",
              "url": "https://watchthismovie.online",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://watchthismovie.online/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "WatchThisMovie",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://watchthismovie.online/logo-512.png"
                },
                "sameAs": [
                  "https://twitter.com/watchthismovie",
                  "https://github.com/watchthismovie"
                ]
              }
            })
          }}
        />

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WGXJ47VM"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WGXJ47VM');
          `}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google Analytics (GA4) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-3V9G2FET14" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3V9G2FET14');
          `}
        </Script>
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