"use client";

import { useState, useMemo } from "react";
import type { Hero } from "@/types/hero";
import type { User } from "@/types/user";
import TeamBuilder from "@/components/match/TeamBuilder";
import RecommendationPanel from "@/components/match/RecommendationPanel";
import { computeRecommendations } from "@/lib/recommendations";

interface MatchHelperContentProps {
  heroes: Hero[];
  user: User | null;
  matrix: Record<string, Record<string, number>>;
}

export default function MatchHelperContent({ heroes, user, matrix }: MatchHelperContentProps) {
  const [enemyTeam, setEnemyTeam] = useState<(string | null)[]>([
    null, null, null, null, null,
  ]);

  const hasEnemies = enemyTeam.some(Boolean);

  // Compute recommendations client-side — no API call needed
  const results = useMemo(() => {
    if (!hasEnemies) return null;
    return computeRecommendations(
      enemyTeam.filter(Boolean) as string[],
      matrix,
      heroes,
      [],
      user?.favorites || []
    );
  }, [enemyTeam, hasEnemies, matrix, heroes, user?.favorites]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-nom8-text mb-2">Competitive</h1>
        <p className="text-nom8-text-muted">
          Enter the enemy team to get your personalised counter picks.
        </p>
      </div>

      <TeamBuilder
        heroes={heroes}
        title="Enemy Team"
        subtitle="Who are you playing against?"
        team={enemyTeam}
        onChange={setEnemyTeam}
        horizontal
      />

      <div className="mt-6">
        {hasEnemies ? (
          <RecommendationPanel
            tanks={results?.tanks || []}
            damage={results?.damage || []}
            support={results?.support || []}
            heroes={heroes}
            loading={false}
            userFavorites={user?.favorites || []}
          />
        ) : (
          <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
            <p className="text-nom8-text-muted text-sm">
              Add enemy heroes to see counter recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
