"use client";

import type { Hero } from "@/types/hero";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

interface Recommendation {
  hero: Hero;
  compositeScore: number;
  breakdown: { vsHero: string; score: number }[];
  isFavorite: boolean;
}

interface RecommendationPanelProps {
  tanks: Recommendation[];
  damage: Recommendation[];
  support: Recommendation[];
  heroes: Hero[];
  loading: boolean;
  userFavorites?: string[];
}

function RecCard({ rec, heroes, rank }: { rec: Recommendation; heroes: Hero[]; rank?: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
      {rank !== undefined && (
        <span className="text-nom8-orange font-bold text-xs w-5 shrink-0">#{rank + 1}</span>
      )}
      <HeroIcon hero={rec.hero} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-nom8-text text-sm">{rec.hero.name}</p>
          {rec.isFavorite && (
            <span className="text-nom8-orange text-xs">♥ Main</span>
          )}
        </div>
        <RoleBadge role={rec.hero.role} />
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-nom8-orange">+{rec.compositeScore}</p>
        <p className="text-xs text-nom8-text-muted">boost</p>
      </div>
    </div>
  );
}

export default function RecommendationPanel({
  tanks,
  damage,
  support,
  heroes,
  loading,
  userFavorites = [],
}: RecommendationPanelProps) {
  if (loading) {
    return (
      <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
        <p className="text-nom8-text-muted">Calculating best picks...</p>
      </div>
    );
  }

  const allRecs = [...tanks, ...damage, ...support];
  if (allRecs.length === 0) {
    return (
      <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
        <p className="text-nom8-text-muted text-sm">No recommendations yet.</p>
      </div>
    );
  }

  const favoriteSet = new Set(userFavorites);
  const mainRecs = allRecs.filter((r) => favoriteSet.has(r.hero.slug)).sort((a, b) => b.compositeScore - a.compositeScore);

  // Perfect composition: best tank + top 2 damage + top 2 support
  const perfectComp = [
    ...(tanks.length > 0 ? [tanks[0]] : []),
    ...damage.slice(0, 2),
    ...support.slice(0, 2),
  ];

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-8">

      {/* Section A — Your Mains */}
      <div>
        <h3 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
          ♥ Your Mains
        </h3>
        {mainRecs.length > 0 ? (
          <div className="space-y-2">
            {mainRecs.map((rec, i) => (
              <RecCard key={rec.hero.slug} rec={rec} heroes={heroes} rank={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-nom8-text-muted">
            Favourite heroes on your profile to get personalised picks.
          </p>
        )}
      </div>

      {/* Section B — Perfect Composition */}
      <div>
        <h3 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-1">
          Perfect Composition
        </h3>
        <p className="text-xs text-nom8-text-muted mb-3">Suggested team vs this enemy lineup</p>
        <div className="flex flex-wrap gap-2">
          {perfectComp.map((rec) => (
            <div
              key={rec.hero.slug}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            >
              <HeroIcon hero={rec.hero} size="sm" />
              <div>
                <p className="text-nom8-text text-xs font-medium">{rec.hero.name}</p>
                <RoleBadge role={rec.hero.role} />
              </div>
            </div>
          ))}
          {perfectComp.length === 0 && (
            <p className="text-sm text-nom8-text-muted">No data yet.</p>
          )}
        </div>
      </div>

      {/* Section C — Per Role Top 5 */}
      {(
        [
          { title: "Tank Picks", recs: tanks },
          { title: "Damage Picks", recs: damage },
          { title: "Support Picks", recs: support },
        ] as const
      ).map(({ title, recs }) => (
        <div key={title}>
          <h3 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
            {title}
          </h3>
          {recs.length > 0 ? (
            <div className="space-y-2">
              {recs.map((rec, i) => (
                <RecCard key={rec.hero.slug} rec={rec} heroes={heroes} rank={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-nom8-text-muted">No recommendations.</p>
          )}
        </div>
      ))}
    </div>
  );
}
