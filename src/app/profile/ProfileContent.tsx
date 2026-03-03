"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Hero } from "@/types/hero";
import HeroGrid from "@/components/hero/HeroGrid";
import CounterPanel from "@/components/counter/CounterPanel";

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
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const router = useRouter();

  const handleToggleFavorite = useCallback(async (slug: string) => {
    // Optimistic update
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
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch {
      // Revert on error
      setFavorites((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nom8-text">My Profile</h1>
          <p className="text-nom8-text-muted text-sm mt-1">
            Signed in as {email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-nom8-text-muted hover:text-nom8-text transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Favorites quick pills */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-nom8-text-muted mb-2">Your mains:</p>
          <div className="flex flex-wrap gap-2">
            {favorites.map((slug) => {
              const hero = heroes.find((h) => h.slug === slug);
              if (!hero) return null;
              return (
                <button
                  key={slug}
                  onClick={() => setSelectedHero(hero)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedHero?.slug === slug
                      ? "border-nom8-orange bg-nom8-orange/10 text-nom8-orange"
                      : "border-white/10 text-nom8-text hover:border-white/20"
                  }`}
                >
                  {hero.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Hero Grid */}
        <div className="lg:col-span-2">
          <p className="text-sm text-nom8-text-muted mb-4">
            Lock in your mains so we can optimize your winrate.
          </p>
          <HeroGrid
            heroes={heroes}
            selectedSlug={selectedHero?.slug}
            onSelect={setSelectedHero}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* Right: Counter Panel */}
        <div className="lg:col-span-1">
          {selectedHero ? (
            <div className="sticky top-24">
              <CounterPanel hero={selectedHero} />
            </div>
          ) : (
            <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
              <p className="text-nom8-text-muted text-sm">
                Select a hero to see who they counter and who counters them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
