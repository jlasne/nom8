"use client";

import type { Hero, HeroRole } from "@/types/hero";
import HeroCard from "./HeroCard";

const roleOrder: HeroRole[] = ["Tank", "Damage", "Support"];

interface HeroGridProps {
  heroes: Hero[];
  selectedSlug?: string;
  onSelect?: (hero: Hero) => void;
  favorites?: string[];
  onToggleFavorite?: (slug: string) => void;
}

export default function HeroGrid({
  heroes,
  selectedSlug,
  onSelect,
  favorites = [],
  onToggleFavorite,
}: HeroGridProps) {
  const grouped = roleOrder.map((role) => ({
    role,
    heroes: heroes.filter((h) => h.role === role),
  }));

  return (
    <div className="space-y-8">
      {grouped.map(({ role, heroes: roleHeroes }) => (
        <div key={role}>
          <h3 className="text-lg font-semibold text-nom8-text mb-3 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                role === "Tank"
                  ? "bg-role-tank"
                  : role === "Damage"
                    ? "bg-role-damage"
                    : "bg-role-support"
              }`}
            />
            {role}
            <span className="text-sm text-nom8-text-muted font-normal">
              ({roleHeroes.length})
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {roleHeroes.map((hero) => (
              <div key={hero.slug} className="relative">
                <HeroCard
                  hero={hero}
                  selected={hero.slug === selectedSlug}
                  onClick={onSelect ? () => onSelect(hero) : undefined}
                />
                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(hero.slug);
                    }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      favorites.includes(hero.slug)
                        ? "text-nom8-orange bg-nom8-orange/20"
                        : "text-nom8-text-muted hover:text-nom8-orange bg-white/5"
                    }`}
                  >
                    {favorites.includes(hero.slug) ? "\u2665" : "\u2661"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
