"use client";

import { useState, useEffect, useRef } from "react";
import type { Hero } from "@/types/hero";
import TeamBuilder from "@/components/match/TeamBuilder";
import RecommendationPanel from "@/components/match/RecommendationPanel";
import PricingSection from "@/components/match/PricingSection";

interface Recommendation {
  hero: Hero;
  compositeScore: number;
  breakdown: { vsHero: string; score: number }[];
  isFavorite: boolean;
}

interface MatchHelperContentProps {
  heroes: Hero[];
}

export default function MatchHelperContent({
  heroes,
}: MatchHelperContentProps) {
  const [enemyTeam, setEnemyTeam] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [yourTeam, setYourTeam] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
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
          body: JSON.stringify({
            enemyTeam: enemyTeam.filter(Boolean),
            yourTeam: yourTeam.filter(Boolean),
          }),
        });
        const data = await res.json();
        setResults(data);
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enemyTeam, yourTeam, hasEnemies]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-nom8-text mb-2">
          Match Helper
        </h1>
        <p className="text-nom8-text-muted">
          Turn teammate chaos into easy wins. Enter the enemy comp to see your
          best picks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enemy Team */}
        <TeamBuilder
          heroes={heroes}
          title="Enemy Team"
          subtitle="Who are you playing against?"
          team={enemyTeam}
          onChange={setEnemyTeam}
        />

        {/* Your Team (optional) */}
        <TeamBuilder
          heroes={heroes}
          title="Your Team"
          subtitle="Optional: fill in your current comp"
          team={yourTeam}
          onChange={setYourTeam}
        />

        {/* Recommendations */}
        <div>
          {hasEnemies ? (
            <RecommendationPanel
              tanks={results?.tanks || []}
              damage={results?.damage || []}
              support={results?.support || []}
              isPaid={results?.isPaid || false}
              heroes={heroes}
              loading={loading}
            />
          ) : (
            <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
              <p className="text-nom8-text-muted text-sm">
                Add at least one enemy hero to see recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      <PricingSection />
    </div>
  );
}
