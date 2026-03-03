"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Hero } from "@/types/hero";
import HeroGrid from "@/components/hero/HeroGrid";
import HeroIcon from "@/components/hero/HeroIcon";

interface ProfileContentProps {
  heroes: Hero[];
  initialFavorites: string[];
  email: string;
}

export default function ProfileContent({
  heroes,
  initialFavorites,
  email,
}: ProfileContentProps) {
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const router = useRouter();

  const handleToggleFavorite = useCallback(async (slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroSlug: slug }),
      });
      const data = await res.json();
      if (data.success) setFavorites(data.favorites);
    } catch {
      setFavorites((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  const handleHeroClick = (hero: Hero) => {
    router.push(`/profile/${hero.slug}`);
  };

  const favoriteHeroes = favorites
    .map((slug) => heroes.find((h) => h.slug === slug))
    .filter(Boolean) as Hero[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-nom8-text">My Profile</h1>
          <p className="text-xs text-nom8-text-muted mt-0.5">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-nom8-text-muted hover:text-nom8-text transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Your Mains */}
      {favoriteHeroes.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-3">
            Your Mains
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {favoriteHeroes.map((hero) => (
              <div key={hero.slug} className="relative">
                <button
                  onClick={() => handleHeroClick(hero)}
                  className="w-full bg-nom8-card rounded-xl border border-nom8-orange/30 bg-nom8-orange/5 p-3 flex flex-col items-center gap-2 hover:border-nom8-orange/60 transition-all"
                >
                  <HeroIcon hero={hero} size="md" />
                  <p className="text-xs font-medium text-nom8-text text-center truncate w-full">
                    {hero.name}
                  </p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(hero.slug);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-nom8-orange bg-nom8-orange/20 text-xs hover:bg-nom8-orange/40 transition-colors"
                >
                  &#x2665;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All heroes */}
      <HeroGrid
        heroes={heroes}
        onSelect={handleHeroClick}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
