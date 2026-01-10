import type { Metadata } from "next";
import { Inter } from "next/font/google"; // <--- FIX: Import Inter correctly
import "./globals.css";
import Navbar from "@/components/Navbar";

// Initialize the font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WatchThisMovie - AI Recommender",
  description: "Stop scrolling, start watching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> 
        {/* Padding top is crucial so content doesn't hide behind the fixed Navbar */}
        <div className="pt-16"> 
          {children}
        </div>
      </body>
    </html>
  );
}