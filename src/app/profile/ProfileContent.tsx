"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Hero, HeroRole } from "@/types/hero";
import HeroGrid from "@/components/hero/HeroGrid";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

interface ProfileContentProps {
  heroes: Hero[];
  initialFavorites: string[];
  email: string;
}

interface CounterEntry {
  slug: string;
  score: number;
  hero?: Hero;
}

interface MainInsight {
  countersMe: CounterEntry[];
  iCounter: CounterEntry[];
}

const SUBROLES_BY_ROLE: Record<HeroRole, string[]> = {
  Tank: ["Initiator", "Bruiser", "Stalwart"],
  Damage: ["Specialist", "Recon", "Flanker", "Sharpshooter"],
  Support: ["Medic", "Survivor", "Tactician"],
};

const ROLE_COLORS: Record<HeroRole, string> = {
  Tank: "text-blue-400",
  Damage: "text-red-400",
  Support: "text-green-400",
};

export default function ProfileContent({
  heroes,
  initialFavorites,
  email,
}: ProfileContentProps) {
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [mainsInsights, setMainsInsights] = useState<Record<string, MainInsight>>({});
  const [targetScores, setTargetScores] = useState<Record<string, number>>({});
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const router = useRouter();
  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));

  useEffect(() => {
    fetch("/api/global-stats")
      .then((r) => r.json())
      .then((d) => setTargetScores(d.allTargetScores || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (favorites.length === 0) return;
    favorites.forEach((slug) => {
      setMainsInsights((prev) => {
        if (prev[slug]) return prev;
        fetch(`/api/matrix?hero=${slug}`)
          .then((r) => r.json())
          .then((data) => {
            const enrich = (arr: CounterEntry[]) =>
              arr.map((e) => ({ ...e, hero: heroMap[e.slug] }));
            setMainsInsights((p) => ({
              ...p,
              [slug]: {
                countersMe: enrich(data.countersMe || []).slice(0, 3),
                iCounter: enrich(data.iCounter || []).slice(0, 3),
              },
            }));
          })
          .catch(() => {});
        return prev;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites.join(",")]);

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

      {/* Mains Analysis toggle */}
      {favoriteHeroes.length > 0 && (
        <button
          onClick={() => setAnalysisOpen((o) => !o)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 transition-colors mb-4"
        >
          <span className="text-xs text-nom8-text-muted uppercase tracking-wider">Mains Analysis</span>
          <span className="text-nom8-text-muted text-xs">{analysisOpen ? "▲" : "▼"}</span>
        </button>
      )}

      {/* Mains Analysis — merged counter insights + subrole analysis */}
      {analysisOpen && favoriteHeroes.length > 0 && (() => {
        const allLoaded = favoriteHeroes.every((h) => mainsInsights[h.slug]);
        const aggCountersMe: Record<string, number> = {};
        const aggICounter: Record<string, number> = {};
        if (allLoaded) {
          favoriteHeroes.forEach((hero) => {
            const insight = mainsInsights[hero.slug];
            insight.countersMe.forEach((e) => { aggCountersMe[e.slug] = (aggCountersMe[e.slug] || 0) + e.score; });
            insight.iCounter.forEach((e) => { aggICounter[e.slug] = (aggICounter[e.slug] || 0) + e.score; });
          });
        }
        const topCounteredBy = Object.entries(aggCountersMe).sort(([, a], [, b]) => b - a).slice(0, 3).map(([slug, score]) => ({ slug, score, hero: heroMap[slug] }));
        const topICounter = Object.entries(aggICounter).sort(([, a], [, b]) => b - a).slice(0, 3).map(([slug, score]) => ({ slug, score, hero: heroMap[slug] }));

        const favSet = new Set(favorites);
        const favSubroles = new Set(favoriteHeroes.map((h) => h.subrole));
        const roleCount: Record<HeroRole, number> = { Tank: 0, Damage: 0, Support: 0 };
        favoriteHeroes.forEach((h) => { roleCount[h.role] = (roleCount[h.role] || 0) + 1; });

        const getSuggestion = (subrole: string): Hero | null => {
          const candidates = heroes.filter((h) => h.subrole === subrole && !favSet.has(h.slug));
          if (candidates.length === 0) return null;
          return candidates.sort((a, b) => (targetScores[a.slug] || 0) - (targetScores[b.slug] || 0))[0];
        };

        return (
          <div className="mb-8 space-y-3">
            <p className="text-xs text-nom8-text-muted uppercase tracking-wider">Mains Analysis</p>

            {/* Counter insights */}
            <div className="bg-nom8-card rounded-xl border border-white/5 p-4">
              {!allLoaded ? (
                <p className="text-xs text-nom8-text-muted">Loading...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-2">Your mains get countered by</p>
                    <div className="space-y-1">
                      {topCounteredBy.length === 0 && <p className="text-xs text-nom8-text-muted">No data yet</p>}
                      {topCounteredBy.map((e, i) => e.hero ? (
                        <Link key={e.slug} href={`/profile/${e.slug}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                          <span className="text-nom8-orange font-bold text-xs w-4">#{i + 1}</span>
                          <HeroIcon hero={e.hero} size="sm" />
                          <span className="text-nom8-text text-xs flex-1 truncate">{e.hero.name}</span>
                          <span className="text-xs text-nom8-text-muted font-mono">{e.score}</span>
                        </Link>
                      ) : null)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-2">Your mains counter best</p>
                    <div className="space-y-1">
                      {topICounter.length === 0 && <p className="text-xs text-nom8-text-muted">No data yet</p>}
                      {topICounter.map((e, i) => e.hero ? (
                        <Link key={e.slug} href={`/profile/${e.slug}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                          <span className="text-nom8-orange font-bold text-xs w-4">#{i + 1}</span>
                          <HeroIcon hero={e.hero} size="sm" />
                          <span className="text-nom8-text text-xs flex-1 truncate">{e.hero.name}</span>
                          <span className="text-xs text-nom8-text-muted font-mono">{e.score}</span>
                        </Link>
                      ) : null)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* General role balance */}
            <div className="bg-nom8-card rounded-xl border border-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-nom8-text-muted">Role balance</p>
              <div className="grid grid-cols-3 gap-3 mb-2">
                {(["Tank", "Damage", "Support"] as HeroRole[]).map((role) => (
                  <div key={role} className="text-center">
                    <p className={`text-xl font-bold ${ROLE_COLORS[role]}`}>{roleCount[role]}</p>
                    <p className="text-xs text-nom8-text-muted">{role}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-nom8-text-muted">
                {roleCount.Tank === 0 ? "No Tank main. " : ""}
                {roleCount.Damage === 0 ? "No Damage main. " : ""}
                {roleCount.Support === 0 ? "No Support main. " : ""}
                {roleCount.Tank > 0 && roleCount.Damage > 0 && roleCount.Support > 0 ? "Good coverage across all three roles." : "Consider adding mains in missing roles."}
              </p>
            </div>

            {/* Per-role subrole coverage */}
            {(["Tank", "Damage", "Support"] as HeroRole[]).map((role) => {
              const mains = favoriteHeroes.filter((h) => h.role === role);
              const covered = SUBROLES_BY_ROLE[role].filter((sr) => favSubroles.has(sr as Hero["subrole"]));
              const missing = SUBROLES_BY_ROLE[role].filter((sr) => !favSubroles.has(sr as Hero["subrole"]));
              return (
                <div key={role} className="bg-nom8-card rounded-xl border border-white/5 p-4">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${ROLE_COLORS[role]}`}>{role}</p>
                  {mains.length === 0 ? (
                    <p className="text-xs text-nom8-text-muted">No {role} mains set.</p>
                  ) : (
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {mains.map((h) => (
                        <Link key={h.slug} href={`/profile/${h.slug}`} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1 hover:bg-white/10 transition-colors">
                          <HeroIcon hero={h} size="sm" />
                          <span className="text-xs text-nom8-text">{h.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    {covered.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {covered.map((sr) => (
                          <span key={sr} className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{sr}</span>
                        ))}
                      </div>
                    )}
                    {missing.map((sr) => {
                      const suggestion = getSuggestion(sr);
                      return (
                        <div key={sr} className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-nom8-text-muted shrink-0">{sr}</span>
                          {suggestion && (
                            <Link href={`/profile/${suggestion.slug}`} className="flex items-center gap-1.5 hover:bg-white/5 rounded-lg px-1.5 py-0.5 transition-colors">
                              <HeroIcon hero={suggestion} size="sm" />
                              <span className="text-xs text-nom8-orange">{suggestion.name}</span>
                              <span className="text-xs text-nom8-text-muted">suggested</span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

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
