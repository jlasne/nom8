"use client";

import { useState, useEffect, useRef } from "react";
import type { Hero } from "@/types/hero";
import type { User } from "@/types/user";
import TeamBuilder from "@/components/match/TeamBuilder";
import RecommendationPanel from "@/components/match/RecommendationPanel";

interface Recommendation {
  hero: Hero;
  compositeScore: number;
  breakdown: { vsHero: string; score: number }[];
  isFavorite: boolean;
}

interface MatchHelperContentProps {
  heroes: Hero[];
  user: User;
}

export default function MatchHelperContent({ heroes, user }: MatchHelperContentProps) {
  const [enemyTeam, setEnemyTeam] = useState<(string | null)[]>([
    null, null, null, null, null,
  ]);
  const [results, setResults] = useState<{
    tanks: Recommendation[];
    damage: Recommendation[];
    support: Recommendation[];
    isPaid: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const hasEnemies = enemyTeam.some(Boolean);

  useEffect(() => {
    if (!hasEnemies) {
      setResults(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enemyTeam: enemyTeam.filter(Boolean) }),
        });
        const data = await res.json();
        setResults(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enemyTeam, hasEnemies]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-nom8-text mb-2">Competitive</h1>
        <p className="text-nom8-text-muted">
          Enter the enemy team to get your personalised counter picks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamBuilder
          heroes={heroes}
          title="Enemy Team"
          subtitle="Who are you playing against?"
          team={enemyTeam}
          onChange={setEnemyTeam}
        />
        <div>
          {hasEnemies ? (
            <RecommendationPanel
              tanks={results?.tanks || []}
              damage={results?.damage || []}
              support={results?.support || []}
              isPaid={results?.isPaid || false}
              heroes={heroes}
              loading={loading}
              userFavorites={user.favorites}
            />
          ) : (
            <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center flex items-center justify-center h-full">
              <p className="text-nom8-text-muted text-sm">
                Add enemy heroes to see counter recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
