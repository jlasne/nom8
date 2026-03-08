import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "nom8 — Community Driven Counter for Overwatch",
  description:
    "Crowd-powered Overwatch counter-picks. Vote on matchups, find your counters, and get smart hero recommendations.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar isLoggedIn={!!user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-white/5 mt-16 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-nom8-text-muted">
            <span>© {new Date().getFullYear()} nom8</span>
            <div className="flex items-center gap-4">
              <Link href="/roadmap" className="hover:text-nom8-text transition-colors">Roadmap</Link>
              <Link href="/privacy" className="hover:text-nom8-text transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
