import type { Metadata } from "next";
import "./globals.css";
import { Inter, Sora } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "../components/theme-toggle";
import { Toaster } from "../components/toaster";
import { MobileNav } from "../components/mobile-nav";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Price Optimizer",
  description: "Modern price optimization tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] min-h-screen text-neutral-900`}>
        <Providers>
          <header>
            <nav className="sticky top-0 z-30 w-full h-[72px] backdrop-blur bg-white/70 border-b border-neutral-200 shadow-sm flex items-center">
              <div className="mx-auto max-w-[1200px] w-full flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                  <Link href="/" className="font-heading font-bold text-xl tracking-tight text-neutral-900 hover:underline underline-offset-4">Price Optimizer</Link>
                  <div className="hidden md:flex gap-2 ml-6">
                    <Link href="/estimate" className="px-3 py-2 rounded-lg hover:underline underline-offset-4 transition">Estimate</Link>
                    <Link href="/about" className="px-3 py-2 rounded-lg hover:underline underline-offset-4 transition">About</Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <div className="md:hidden">
                    <MobileNav />
                  </div>
                </div>
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 min-h-[calc(100vh-72px-48px)]">
            {children}
          </main>
          <footer className="w-full border-t border-neutral-200 bg-white/70 text-xs text-neutral-500 py-3 flex justify-center items-center h-12">
            <div className="flex gap-4">
              <Link href="#" className="hover:underline">Terms</Link>
              <span>|</span>
              <Link href="#" className="hover:underline">Privacy</Link>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
