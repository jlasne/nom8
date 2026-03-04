"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const authLinks = [
  { href: "/", label: "Counterwatch" },
  { href: "/profile", label: "My Profile" },
  { href: "/match", label: "Competitive" },
];

const publicLinks = [
  { href: "/", label: "Counterwatch" },
];

export default function Navbar({ isLoggedIn: initialIsLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [voteCount, setVoteCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    fetch("/api/vote-count")
      .then((r) => r.json())
      .then((d) => setVoteCount(d.total))
      .catch(() => {});
  }, []);

  const links = isLoggedIn ? authLinks : publicLinks;

  return (
    <nav className="border-b border-white/5 bg-nom8-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-14">
          {/* Logo — orange triangle */}
          <Link href="/" className="flex items-center text-nom8-orange hover:text-nom8-orange-light transition-colors" aria-label="nom8 home">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <polygon points="10,2 19,18 1,18" />
            </svg>
          </Link>

          {/* Nav links — centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-nom8-orange bg-nom8-orange/10"
                      : "text-nom8-text-muted hover:text-nom8-text hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {voteCount !== null && (
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-nom8-orange animate-pulse" />
                <span className="text-xs font-mono text-nom8-text-muted">
                  {voteCount.toLocaleString()} votes
                </span>
              </span>
            )}
            {!isLoggedIn && (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-nom8-orange hover:bg-nom8-orange/90 text-white transition-colors"
              >
                Connect
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
