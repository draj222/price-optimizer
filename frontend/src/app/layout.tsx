import "@fontsource/inter/variable.css";
import "@fontsource/sora/variable.css";
import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] min-h-screen text-neutral-900">
        <nav className="sticky top-0 z-30 w-full backdrop-blur bg-white/70 border-b border-neutral-200 shadow-sm">
          <div className="mx-auto max-w-[1200px] px-6 py-3 flex items-center justify-between">
            <span className="font-bold text-lg tracking-tight">Price Optimizer</span>
            <a href="/estimate" className="rounded px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-700 transition">Estimate</a>
          </div>
        </nav>
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          {children}
        </div>
      </body>
    </html>
  );
}
